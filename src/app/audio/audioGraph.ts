import * as Tone from "tone";
import { produce } from "immer";
import { semitonesToHz } from "./utils";

const context = new AudioContext();

export interface Node {
  children?: Node[];
  type: "osc" | "filter" | "sequencer" | "destination";
  props?: any;
  key?: string;
}

type SequencerCallbackId = number;
interface InternalNode extends Node {
  audioNode: AudioNode | null;
  sequencerCallbackId: SequencerCallbackId | null;
  parent: AudioNode | null;
}

export interface OscProps {
  type: OscillatorType;
  frequency: number;
}
export interface OscNode extends Node {
  type: "osc";
  props: OscProps;
}

export interface FilterProps {
  type: "lowpass" | "highpass";
  frequency: number;
  q: number;
}
export interface FilterNode extends Node {
  type: "filter";
  props: FilterProps;
}

export interface SequencerProps {
  // Uses Tone's time notation described here:
  // https://github.com/Tonejs/Tone.js/wiki/Time
  rate: string;
  // numSteps: number;
  transposition: number;
  destinationNodes: string[];
}

export interface SequencerNode extends Node {
  type: "sequencer";
  props: SequencerProps;
}

let currentRoot: InternalNode | null = null;

let keyedNodes = new Map<string, InternalNode>();

function buildOscNode(node: InternalNode & OscNode): OscillatorNode {
  const oscNode = new OscillatorNode(context);
  const oscType = node.props.type;
  oscNode.type = oscType;
  oscNode.frequency.value = node.props.frequency;
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

function buildAudioNode(
  node: InternalNode
): AudioNode | SequencerCallbackId | null {
  switch (node.type) {
    case "osc": {
      // Osc nodes are created dynamically when they are triggered by a sequence
      return null;
    }
    case "filter":
      return new BiquadFilterNode(context);
    case "destination":
      return context.destination;
    case "sequencer": {
      return Tone.getTransport().scheduleRepeat((time) => {
        const seqNode = node as SequencerNode;
        for (const nodeKey of seqNode.props.destinationNodes) {
          const destNode = keyedNodes.get(nodeKey);
          if (!destNode) {
            throw new Error(
              `Unable to connect sequencer to node with key: ${nodeKey}`
            );
          }
          const osc = buildOscNode(destNode as OscNode & InternalNode);
          osc.frequency.value = semitonesToHz(
            seqNode.props.transposition,
            (destNode as OscNode).props.frequency
          );
          osc.start(time);
          osc.stop(time + 0.1);
        }
      }, (node as SequencerNode).props.rate);
    }
  }
}

function deleteNode(node: InternalNode) {
  if (node.key) {
    keyedNodes.delete(node.key);
  }

  // Remove existing node
  if (node.children) {
    node.children.forEach((n) => deleteNode(n as InternalNode));
  }
  node.audioNode?.disconnect();
  if (node.sequencerCallbackId) {
    Tone.getTransport().clear(node.sequencerCallbackId);
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

function compareNodesAndUpdateGraph({
  newNode,
  currentNode,
  parentNode,
}: {
  newNode: InternalNode;
  currentNode: InternalNode | null;
  parentNode: AudioNode | null;
}) {
  const keyMatch = newNode.key && newNode.key === currentNode?.key;
  const addNode =
    !keyMatch && (!currentNode || newNode.type !== currentNode.type);
  if (addNode) {
    if (currentNode) {
      // Remove existing node
      deleteNode(currentNode);
    }
    if (newNode.key) {
      keyedNodes.set(newNode.key, newNode);
    }
    newNode.parent = parentNode;
    // Build the new audio node
    const nodeOrSequencerId = buildAudioNode(newNode);
    if (nodeOrSequencerId instanceof AudioNode) {
      newNode.audioNode = nodeOrSequencerId;
      if (parentNode) {
        newNode.audioNode?.connect(parentNode);
      }
    } else if (typeof nodeOrSequencerId === "number") {
      newNode.sequencerCallbackId = nodeOrSequencerId;
    }
  } else {
    newNode.audioNode = currentNode.audioNode;
  }
  applyPropUpdates(newNode, currentNode);
}

/// Recursively iterates over the children of newNode and currentNode and adds or
/// removes AudioNodes from the tree to satisfy the requested state.
function compareChildNodesAndUpdateGraph(
  newParent: InternalNode,
  currentParent: InternalNode | null
) {
  if (newParent.children) {
    newParent.children.forEach((newChild: Node, index: number) => {
      const currentChild =
        currentParent &&
        currentParent.children &&
        currentParent.children.length < index
          ? currentParent.children[index]
          : null;
      buildAudioGraph({
        newNode: newChild as InternalNode,
        currentNode: currentChild as InternalNode | null,
        parentNode: newParent.audioNode,
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
      deleteNode(currentParent.children![i] as InternalNode);
    }
  }
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
  newNode: InternalNode;
  currentNode: InternalNode | null;
  parentNode: AudioNode | null;
}): AudioNode | null {
  compareNodesAndUpdateGraph({ newNode, currentNode, parentNode });
  // Note: compareAndUpdateChildren() will recursively call buildAudioGraph() for child nodes
  // to build out the entire tree.
  compareChildNodesAndUpdateGraph(newNode, currentNode);
  return newNode.audioNode;
}

/// Renders the tree rooted in `newRoot` by comparing it to the current tree and applying
/// the minimum number of WebAudio node operations to fulfill the requested state.
export function render(newRoot: Node) {
  buildAudioGraph({
    newNode: newRoot as InternalNode,
    currentNode: currentRoot,
    parentNode: null,
  });
  currentRoot = produce(currentRoot, () => newRoot);
  if (context.state !== "running") {
    start();
  }
}

export function start() {
  Tone.getTransport().bpm.value = 128;
  Tone.getTransport().loop = true;
  Tone.getTransport().setLoopPoints("1:1:1", "17:1:1");
  Tone.getTransport().start();
}
