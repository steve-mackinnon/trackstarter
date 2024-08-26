import { produce, setAutoFreeze } from "immer";
import * as Tone from "tone";
import unmuteIosAudio from "unmute-ios-audio";
import { Sequencer } from "./sequencer";

unmuteIosAudio();
const context = new AudioContext();

// Disable auto freezing in immer so we can mutate the current state when
// setting props
setAutoFreeze(false);

export type NodeType = "osc" | "filter" | "sequencer" | "destination";

interface BaseNode {
  children?: Node[];
  type: NodeType;
  key?: string;
  parentBackingNode?: AudioNode;
}

export interface OscProps {
  type: OscillatorType;
  detune: number;
}

export interface OscNode extends BaseNode {
  type: "osc";
  props: OscProps;
  backingNode?: OscillatorNode;
}

export interface FilterProps {
  type: BiquadFilterType;
  frequency: number;
  q: number;
}
export interface FilterNode extends BaseNode {
  type: "filter";
  props: FilterProps;
  backingNode?: BiquadFilterNode;
}

export interface DestinationNode extends BaseNode {
  type: "destination";
  props: any;
  backingNode?: never;
}

export interface SequencerEvent {
  note: string;
  startStep: number;
  endStep: number;
}

export interface SequencerProps {
  /// Uses Tone's time notation described here:
  /// https://github.com/Tonejs/Tone.js/wiki/Time
  rate: string;
  transposition: number;
  destinationNodes: string[];
  length: number;
  steps: number;
  // rootNote: Note;
  octave: number;
  /// must be [0, 1]
  probability: number;
  // Ordered list of notes to play in the sequence. If notes.length()
  // is smaller than length, the sequence will wrap until the sequence
  // restarts.
  notes: string[] | SequencerEvent[];
}

export interface SequencerNode extends BaseNode {
  type: "sequencer";
  props: SequencerProps;
  backingNode?: Sequencer;
}

export type Node = OscNode | FilterNode | SequencerNode | DestinationNode;

/// Renders the tree rooted in `newRoot` by comparing it to the current tree and applying
/// the minimum number of WebAudio node operations to fulfill the requested state.
export function render(newRoot: Node) {
  newRoot = buildAudioGraph({
    newNode: newRoot,
    currentNode: currentRoot,
    parentBackingNode: null,
  });
  currentRoot = produce(currentRoot, () => newRoot);
}

let hasStarted = false;
let stepIndex = 0;
let playing = false;
const SEQUENCE_LENGTH = 1024;

export function start(startStep?: number) {
  Tone.getTransport().bpm.value = 128;
  Tone.getTransport().loop = true;
  Tone.getTransport().setLoopPoints("1:1:1", "17:1:1");

  stepIndex = startStep ?? 0;
  Tone.getTransport().start();
  playing = true;
  if (hasStarted) {
    return;
  }
  Tone.getTransport().scheduleRepeat((t) => {
    if (!playing || !currentRoot || !currentRoot.children) {
      return;
    }
    applyToSequencers(currentRoot, (seq) =>
      seq.backingNode?.playStep(stepIndex, t)
    );
    stepIndex = (stepIndex + 1) % SEQUENCE_LENGTH;
  }, "16n");
  hasStarted = true;
}

export function stop() {
  playing = false;
  Tone.getTransport().stop();
  stepIndex = 0;
  if (currentRoot) {
    applyToSequencers(currentRoot, (seq) => seq.backingNode?.stop());
  }
}

type NodeProps<T extends Node["type"]> = Extract<Node, { type: T }>["props"];

export function setProperty<
  T extends Node["type"],
  P extends keyof NodeProps<T>
>(nodeKey: string, nodeType: T, propId: P, value: NodeProps<T>[P]) {
  if (!currentRoot) {
    return;
  }
  const node = findNodeWithKey(currentRoot, nodeKey);
  if (!node) {
    return;
  }
  if (node.type === nodeType) {
    node.props[propId] = value;
    applyNodeProps(node);
  } else {
    throw new Error(
      `Node types were incompatible ${nodeType} and ${node.type}`
    );
  }
}

export function getCurrentStep(): number {
  return stepIndex;
}

let currentRoot: DestinationNode | null = null;

function applyNodeProps(node: Node) {
  if (node.type === "filter" && node.backingNode) {
    node.backingNode.frequency.value = node.props.frequency;
    node.backingNode.type = node.props.type;
    node.backingNode.Q.value = node.props.q;
  }
}

function buildOscNode(node: OscNode): OscillatorNode {
  const oscNode = new OscillatorNode(context);
  const oscType = node.props.type;
  oscNode.type = oscType;

  // Patch in a gain node to attenuate the osc signal and avoid clipping
  const gainNode = new GainNode(context);
  gainNode.gain.value = 0.1;
  oscNode.connect(gainNode);

  const dest = node.parentBackingNode;
  if (!dest) {
    throw new Error(
      "Missing parent node to connect to. Some audio will not be generated"
    );
  } else {
    gainNode.connect(dest);
  }
  return oscNode;
}

function findNodeWithKey(root: Node | null, key: string): Node | null {
  if (!root) {
    return null;
  }
  if (root.key === key) {
    return root;
  }
  if (root.children) {
    for (const child of root.children) {
      const node = findNodeWithKey(child, key);
      if (node) {
        return node;
      }
    }
  }
  return null;
}

function buildBackingNode(node: Node): AudioNode | Sequencer | null {
  switch (node.type) {
    case "osc": {
      // Osc nodes are created dynamically when they are triggered by a sequence
      return null;
    }
    case "filter": {
      return new BiquadFilterNode(context);
    }
    case "destination":
      return context.destination;
    case "sequencer": {
      return new Sequencer(
        node,
        (key) => findNodeWithKey(currentRoot, key),
        (dest) => buildOscNode(dest as OscNode)
      );
    }
  }
}

function deleteNode(node: Node) {
  // Remove existing node
  if (node.children) {
    node.children.forEach((n) => deleteNode(n));
  }
  if (node.backingNode && node.backingNode instanceof AudioNode) {
    node.backingNode?.disconnect();
  }
}

function applyPropUpdates(newNode: Node, currentNode: Node | null) {
  if (!newNode.props) {
    return;
  }
  if (typeof newNode.props !== "object") {
    throw new Error("Node.props must be an object");
  }
  for (const prop of Object.keys(newNode.props)) {
    if (
      !currentNode?.props ||
      currentNode?.props[prop] !== newNode.props[prop]
    ) {
      console.log(`${newNode.type}: Update ${prop} to ${newNode.props[prop]}`);
    } else {
      console.log(`${newNode.type}: Not updating ${prop}`);
    }
  }
}

/// Recursively iterates over the children of newNode and currentNode and adds or
/// removes AudioNodes from the tree to satisfy the requested state.
function applyChildNodeUpdates(
  newParent: Node,
  currentParent: Node | null
): Node {
  if (newParent.children) {
    newParent.children.forEach((newChild: Node, index: number) => {
      const currentChild =
        currentParent &&
        currentParent.children &&
        currentParent.children.length > index
          ? currentParent.children[index]
          : null;
      const backingNode =
        newParent.backingNode instanceof AudioNode
          ? newParent.backingNode
          : null;
      newParent = produce(newParent, (parent) => {
        parent.children![index] = buildAudioGraph({
          newNode: newChild,
          currentNode: currentChild,
          parentBackingNode: backingNode,
        });
      });
    });
  }

  // Delete removed children
  const numNewChildren = newParent.children ? newParent.children.length : 0;
  if (
    currentParent &&
    currentParent.children &&
    currentParent.children.length > numNewChildren
  ) {
    // Delete any children that are no longer in the child array
    for (let i = numNewChildren; i < currentParent.children!.length; ++i) {
      deleteNode(currentParent.children![i]);
    }
  }
  return newParent;
}

/// Recursively builds a WebAudio graph by diffing the new tree (rooted at newNode) with
/// the current tree, then adding, removing, or updating AudioNodes and updating their
/// connections to fulfill the requested state.
///
/// Returns the AudioNode created for `newNode`, or null if no AudioNode was created. Generator
/// nodes get created on the fly when they are needed, so they are not created while building
/// the graph.
function buildAudioGraph({
  newNode,
  currentNode,
  parentBackingNode,
}: {
  newNode: Node;
  currentNode: Node | null;
  parentBackingNode: AudioNode | null;
}): Node {
  const keyMatch = newNode.key && newNode.key === currentNode?.key;
  const addNode =
    !keyMatch && (!currentNode || newNode.type !== currentNode.type);
  if (addNode) {
    if (currentNode) {
      // Remove existing node
      deleteNode(currentNode);
    }
    newNode = produce(newNode, (node) => {
      node.parentBackingNode = parentBackingNode ?? undefined;
    });
    // Build the new audio node
    newNode = produce(newNode, (node) => {
      node.backingNode = buildBackingNode(newNode) as any;
    });
    applyNodeProps(newNode);
    if (parentBackingNode && newNode.backingNode instanceof AudioNode) {
      newNode.backingNode.connect(parentBackingNode);
    }
  } else {
    newNode = produce(newNode, (node) => {
      node.parentBackingNode = currentNode.parentBackingNode;
      node.backingNode = currentNode.backingNode;
    });
    if (newNode.backingNode instanceof Sequencer) {
      newNode.backingNode.setNode(newNode as SequencerNode);
    }
  }
  applyPropUpdates(newNode, currentNode);
  return applyChildNodeUpdates(newNode, currentNode);
}

function applyToSequencers(root: Node, fn: (seq: SequencerNode) => void) {
  root.children
    ?.filter((n) => n.type === "sequencer")
    .forEach((seq) => fn(seq));
}
