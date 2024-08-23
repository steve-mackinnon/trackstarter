import { produce, setAutoFreeze } from "immer";
import * as Tone from "tone";
import { Sequencer } from "./sequencer";

const context = new AudioContext();

const sequencerStepCountMap = new Map<string, number>();

// Disable auto freezing in immer so we can mutate the current state when
// setting props
setAutoFreeze(false);

export type NodeType = "osc" | "filter" | "sequencer" | "destination";

interface BaseNode {
  children?: Node[];
  type: NodeType;
  key?: string;
  sequencer?: Sequencer;
  parent?: AudioNode;
}

export interface OscProps {
  type: OscillatorType;
  detune: number;
}

export interface OscNode extends BaseNode {
  type: "osc";
  props: OscProps;
  audioNode?: OscillatorNode;
}

export interface FilterProps {
  type: BiquadFilterType;
  frequency: number;
  q: number;
}
export interface FilterNode extends BaseNode {
  type: "filter";
  props: FilterProps;
  audioNode?: BiquadFilterNode;
}

export interface DestinationNode extends BaseNode {
  type: "destination";
  props: any;
  audioNode?: never;
}

export type Note =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export interface SequencerProps {
  // Uses Tone's time notation described here:
  // https://github.com/Tonejs/Tone.js/wiki/Time
  rate: string;
  transposition: number;
  destinationNodes: string[];
  length: number;
  steps: number;
  rootNote: Note;
  octave: number;
}

export interface SequencerNode extends BaseNode {
  type: "sequencer";
  props: SequencerProps;
  audioNode?: any;
}

export type Node = OscNode | FilterNode | SequencerNode | DestinationNode;

/// Renders the tree rooted in `newRoot` by comparing it to the current tree and applying
/// the minimum number of WebAudio node operations to fulfill the requested state.
export function render(newRoot: Node) {
  newRoot = buildAudioGraph({
    newNode: newRoot,
    currentNode: currentRoot,
    parentNode: null,
  });
  currentRoot = produce(currentRoot, () => newRoot);
}

let sequencerCallbackId: number | null = null;
let stepIndex = 0;
const SEQUENCE_LENGTH = 1024;

export function start() {
  Tone.getTransport().bpm.value = 128;
  Tone.getTransport().loop = true;
  Tone.getTransport().setLoopPoints("1:1:1", "17:1:1");
  Tone.getTransport().start();
  sequencerCallbackId = Tone.getTransport().scheduleRepeat((t) => {
    if (!currentRoot || !currentRoot.children) {
      return;
    }
    // Assume all sequencers are top-level children
    for (const child of currentRoot.children) {
      child.sequencer?.playStep(stepIndex, t);
    }
    stepIndex = (stepIndex + 1) % SEQUENCE_LENGTH;
  }, "16n");
}

export function stop() {
  Tone.getTransport().stop();
  if (sequencerCallbackId) {
    Tone.getTransport().clear(sequencerCallbackId);
    sequencerCallbackId = null;
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

let currentRoot: DestinationNode | null = null;

function applyNodeProps(node: Node) {
  if (node.type === "filter" && node.audioNode) {
    node.audioNode.frequency.value = node.props.frequency;
    node.audioNode.type = node.props.type;
    node.audioNode.Q.value = node.props.q;
  }
}

function buildOscNode(node: OscNode): OscillatorNode {
  const oscNode = new OscillatorNode(context);
  const oscType = node.props.type;
  oscNode.type = oscType;
  const dest = node.parent;
  if (!dest) {
    throw new Error(
      "Missing parent node to connect to. Some audio will not be generated"
    );
  } else {
    oscNode.connect(dest);
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

function buildAudioNode(node: Node): AudioNode | Sequencer | null {
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
  node.audioNode?.disconnect();
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

function compareNodesAndUpdateGraph({
  newNode,
  currentNode,
  parentNode,
}: {
  newNode: Node;
  currentNode: Node | null;
  parentNode: AudioNode | null;
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
      node.parent = parentNode ?? undefined;
    });
    // Build the new audio node
    const nodeOrSequencer = buildAudioNode(newNode);
    if (nodeOrSequencer instanceof AudioNode) {
      newNode = produce(newNode, (node) => {
        node.audioNode = nodeOrSequencer;
      });
      applyNodeProps(newNode);
      if (parentNode) {
        newNode.audioNode?.connect(parentNode);
      }
    } else if (nodeOrSequencer instanceof Sequencer) {
      newNode = produce(newNode, (node) => {
        node.sequencer = nodeOrSequencer;
      });
    }
  } else {
    newNode = produce(newNode, (node) => {
      node.parent = currentNode.parent;
      node.audioNode = currentNode.audioNode;
      node.sequencer = currentNode.sequencer;
    });
  }
  applyPropUpdates(newNode, currentNode);
  return newNode;
}

/// Recursively iterates over the children of newNode and currentNode and adds or
/// removes AudioNodes from the tree to satisfy the requested state.
function compareChildNodesAndUpdateGraph(
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
      newParent = produce(newParent, (parent) => {
        parent.children![index] = buildAudioGraph({
          newNode: newChild,
          currentNode: currentChild,
          parentNode: newParent.audioNode ?? null,
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
  parentNode,
}: {
  newNode: Node;
  currentNode: Node | null;
  parentNode: AudioNode | null;
}): Node {
  newNode = compareNodesAndUpdateGraph({ newNode, currentNode, parentNode });
  // Note: compareAndUpdateChildren() will recursively call buildAudioGraph() for child nodes
  // to build out the entire tree.
  newNode = compareChildNodesAndUpdateGraph(newNode, currentNode);
  return newNode;
}
