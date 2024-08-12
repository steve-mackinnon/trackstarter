import * as Tone from "tone";
import { produce } from "immer";

const context = new AudioContext();

export interface Node {
  children?: Node[];
  id: number;
  nodeType: "osc" | "filter" | "destination";
  props?: any;
}

export interface OscNode extends Node {
  nodeType: "osc";
  props: {
    type: OscillatorType;
    frequency: number;
  };
}

export interface FilterNode extends Node {
  nodeType: "filter";
  props: {
    type: "lowpass" | "highpass";
    frequency: number;
    q: number;
  };
}

export type DestinationNode = 0;

export type NodeStore = Map<number, OscNode | FilterNode>;
export type Sequence = Array<Array<number>>;
export interface AudioState {
  sequence: Sequence;
  nodes: NodeStore;
}

let currentRoot: Node | null = null;
let nodeStore = new Map<number, AudioNode>();

function buildAudioNode(node: Node): AudioNode | null {
  switch (node.nodeType) {
    case "osc":
      // Osc nodes are created dynamically when they are triggered by a sequence
      return null;
    case "filter":
      return new BiquadFilterNode(context);
    case "destination":
      return context.destination;
  }
}

function deleteNode(node: Node) {
  // Remove existing node
  if (node.children) {
    node.children.forEach((n) => deleteNode(n));
  }
  nodeStore.get(node.id)?.disconnect();
  nodeStore.delete(node.id);
}

function replaceNodeIfChanged(newNode: Node, currentNode: Node | null) {
  let shouldReplaceNode = !currentNode || newNode.id != currentNode.id;
  if (shouldReplaceNode) {
    if (currentNode) {
      // Remove existing node
      deleteNode(currentNode);
    }
    // Build the new audio node
    const audioNode = buildAudioNode(newNode);
    if (audioNode) {
      nodeStore.set(newNode.id, audioNode);
    }
  }
}

/// Recursively iterates over the children of newNode and currentNode and adds or
/// removes AudioNodes from the tree to satisfy the requested state.
function compareAndUpdateChildren(newNode: Node, currentNode: Node | null) {
  // Find and add new children
  if (newNode.children) {
    const parentAudioNode = nodeStore.get(newNode.id);
    // Create a hash map for constant time lookup using the node id during the
    // for loop over children.
    const currentChildren = new Map<number, Node>(
      currentNode?.children?.map((n) => [n.id, n])
    );
    for (const newChild of newNode.children) {
      // Look for a match of the child's id in the current child array
      const currentChild = currentChildren.get(newChild.id);
      const childAudioNode = buildAudioGraph(newChild, currentChild ?? null);
      if (childAudioNode) {
        if (parentAudioNode) {
          childAudioNode.connect(parentAudioNode);
        } else {
          console.warn(
            `Parent node was unexpectedly missing. Unable to connect ${newChild.nodeType} node with ID ${newChild.id} to graph`
          );
        }
      }
    }
  }
  // Delete removed children
  if (currentNode && currentNode.children) {
    const newChildren = new Map<number, Node>(
      newNode.children?.map((n) => [n.id, n])
    );
    for (const childNode of currentNode.children) {
      if (!newChildren.has(childNode.id)) {
        deleteNode(childNode);
      }
    }
  }
}

/// Recursively builds a WebAudio graph by diffing the new tree (rooted at newNode) with
/// the current tree, then adding and/or removing AudioNodes and updating their connections
/// to fulfill the requested state.
///
/// Returns the AudioNode created for `newNode`, or null if no AudioNode was created. Generator
/// nodes get created on the fly when they are needed, so they are not created while building
/// the graph.
function buildAudioGraph(
  newNode: Node,
  currentNode: Node | null
): AudioNode | null {
  replaceNodeIfChanged(newNode, currentNode);
  // Note: compareAndUpdateChildren() will recursively call buildAudioGraph() for child nodes
  // to build out the entire tree.
  compareAndUpdateChildren(newNode, currentNode);
  const node = nodeStore.get(newNode.id) ?? null;
  return node;
}

let started = false;
/// Renders the tree rooted in `newRoot` by comparing it to the current tree and applying
/// the minimum number of WebAudio node operations to fulfill the requested state.
export function render(newRoot: Node) {
  buildAudioGraph(newRoot, currentRoot);
  currentRoot = produce(currentRoot, () => newRoot);
  if (!started) {
    start();
    started = true;
  }
}

function instantiateGenerators(root: Node, time: number) {
  if (!root.children) {
    return;
  }
  for (const child of root.children) {
    // TODO: this randomized sequence logic is here for testing. Triggers should
    // be driven by some sort of sequencer node.
    if (child.nodeType === "osc" && Math.random() > 0.2) {
      const oscNode = new OscillatorNode(context);
      const node = child as OscNode;
      const oscType = node.props.type;
      oscNode.type = oscType;
      oscNode.frequency.value = node.props.frequency;
      oscNode.start(time);
      oscNode.stop(time + 0.1);
      const dest = nodeStore.get(root.id);
      if (!dest) {
        console.error(
          "Missing parent node to connect to. Some audio will not be generated"
        );
      } else {
        oscNode.connect(dest);
      }
    }
    instantiateGenerators(child, time);
  }
}

export function start() {
  Tone.getTransport().bpm.value = 128;
  Tone.getTransport().loop = true;
  Tone.getTransport().setLoopPoints("1:1:1", "17:1:1");
  Tone.getTransport().scheduleRepeat((time) => {
    if (!currentRoot) {
      return;
    }
    instantiateGenerators(currentRoot, time);
  }, "16n");
  Tone.getTransport().start();
}
