import { produce, setAutoFreeze } from "immer";
import * as Tone from "tone";
import { ADSR, ADSRProps } from "./adsr";
import { buildOscNode } from "./backingNodes";
import { Sequencer } from "./sequencer";
import { unmute } from "./unmute";

const context = new AudioContext();
unmute(context, false, false);
Tone.setContext(context);

// Disable auto freezing in immer so we can mutate the current state when
// setting props
setAutoFreeze(false);

export type NodeType =
  | "osc"
  | "filter"
  | "sequencer"
  | "destination"
  | "mul"
  | "adsr";

interface BaseNode {
  children?: Node[];
  type: NodeType;
  key?: string;
  parent?: Node;
}

export interface OscProps {
  type: OscillatorType;
  detune: number;
  modSources?: {
    gain?: string[];
    frequency?: string[];
  };
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

export interface MulProps {
  multiplier: number;
}
export interface MulNode extends BaseNode {
  type: "mul";
  props: MulProps;
  backingNode?: GainNode;
}

export interface ADSRNode extends BaseNode {
  type: "adsr";
  props: ADSRProps;
  backingNode?: ADSR;
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

export type Node =
  | OscNode
  | FilterNode
  | SequencerNode
  | DestinationNode
  | MulNode
  | ADSRNode;

/// Renders the tree rooted in `newRoot` by comparing it to the current tree and applying
/// the minimum number of WebAudio node operations to fulfill the requested state.
export function render(newRoot: Node) {
  newRoot = buildAudioGraph({
    newNode: newRoot,
    currentNode: currentRoot,
    parent: null,
  });
  currentRoot = produce(currentRoot, () => newRoot);
}

let hasStarted = false;
let stepIndex = 0;
let playing = false;
const SEQUENCE_LENGTH = 1024;

export async function start(startStep?: number) {
  Tone.getTransport().bpm.value = 160;
  Tone.getTransport().loop = true;
  Tone.getTransport().setLoopPoints("1:1:1", "17:1:1");

  // if (context.state !== "running") {
  // await Tone.start();
  // }
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
      seq.backingNode?.playStep(stepIndex, t),
    );
    stepIndex = (stepIndex + 1) % SEQUENCE_LENGTH;
  }, "16n");
  hasStarted = true;
}

export function stop() {
  playing = false;
  Tone.getTransport().pause();
  stepIndex = 0;
  if (currentRoot) {
    applyToSequencers(currentRoot, (seq) => seq.backingNode?.stop());
  }
}

type NodeProps<T extends Node["type"]> = Extract<Node, { type: T }>["props"];

export function setProperty<
  T extends Node["type"],
  P extends keyof NodeProps<T>,
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
    applyPropUpdates(node);
  } else {
    throw new Error(
      `Node types were incompatible ${nodeType} and ${node.type}`,
    );
  }
}

export function getCurrentStep(): number {
  return stepIndex;
}

export let currentRoot: DestinationNode | null = null;

export function findNodeWithKey(root: Node | null, key: string): Node | null {
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
    case "mul":
      return new GainNode(context);
    case "adsr":
      // ADSR nodes are built on the fly when triggered
      return null;
    case "sequencer": {
      return new Sequencer(
        node,
        (key) => findNodeWithKey(currentRoot, key),
        (node, freq, startTime, endTime) => {
          if (node.type === "osc") {
            return buildOscNode(
              context,
              node,
              freq,
              startTime,
              endTime,
              currentRoot as Node,
            );
          }
        },
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

function applyPropUpdates<T extends Node>(newNode: T) {
  if (!newNode.backingNode) {
    return;
  }
  switch (newNode.type) {
    case "filter": {
      newNode.backingNode.frequency.value = newNode.props.frequency;
      newNode.backingNode.type = newNode.props.type;
      newNode.backingNode.Q.value = newNode.props.q;
      break;
    }
    case "mul": {
      newNode.backingNode.gain.value = newNode.props.multiplier;
      break;
    }
    case "adsr": {
      // TODO: split out prop update handlers into a separate place
      newNode.backingNode.update(newNode.props);
    }
  }
}

/// Recursively iterates over the children of newNode and currentNode and adds or
/// removes AudioNodes from the tree to satisfy the requested state.
function applyChildNodeUpdates(
  newParent: Node,
  currentParent: Node | null,
): Node {
  if (newParent.children) {
    newParent.children.forEach((newChild: Node, index: number) => {
      const currentChild =
        currentParent &&
        currentParent.children &&
        currentParent.children.length > index
          ? currentParent.children[index]
          : null;
      newParent = produce(newParent, (parent) => {
        parent.children![index] = buildAudioGraph({
          newNode: newChild,
          currentNode: currentChild,
          parent: newParent,
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
  parent,
}: {
  newNode: Node;
  currentNode: Node | null;
  parent: Node | null;
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
      node.parent = parent ?? undefined;
      // Build the new audio node
      node.backingNode = buildBackingNode(newNode) as any;
    });
    if (
      parent?.backingNode instanceof AudioNode &&
      newNode.backingNode instanceof AudioNode
    ) {
      newNode.backingNode.connect(parent.backingNode);
    }
  } else {
    newNode = produce(newNode, (node) => {
      node.parent = currentNode.parent;
      node.backingNode = currentNode.backingNode;
    });
    if (newNode.backingNode instanceof Sequencer) {
      newNode.backingNode.setNode(newNode as SequencerNode);
    }
  }
  const updatedNode = applyChildNodeUpdates(newNode, currentNode);
  applyPropUpdates(updatedNode);
  return updatedNode;
}

function applyToSequencers(root: Node, fn: (seq: SequencerNode) => void) {
  root.children
    ?.filter((n) => n.type === "sequencer")
    .forEach((seq) => fn(seq));
}
