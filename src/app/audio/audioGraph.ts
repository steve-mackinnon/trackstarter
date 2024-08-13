import * as Tone from "tone";
import { produce } from "immer";

const context = new AudioContext();

export interface Node {
  children?: Node[];
  nodeType: "osc" | "filter" | "destination";
  props?: any;
}

interface NodeWithRef extends Node {
  audioNode: AudioNode | null;
}

export interface OscProps {
  type: OscillatorType;
  frequency: number;
}
export interface OscNode extends Node {
  nodeType: "osc";
  props: OscProps;
}

export interface FilterProps {
  type: "lowpass" | "highpass";
  frequency: number;
  q: number;
}
export interface FilterNode extends Node {
  nodeType: "filter";
  props: FilterProps;
}

let currentRoot: NodeWithRef | null = null;

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

function deleteNode(node: NodeWithRef) {
  // Remove existing node
  if (node.children) {
    node.children.forEach((n) => deleteNode(n as NodeWithRef));
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
      console.log(
        `${newNode.nodeType}: Update ${prop} to ${newNode.props[prop]}`
      );
    } else {
      console.log(`${newNode.nodeType}: Not updating ${prop}`);
    }
  }
}

function updateOrReplaceNodeIfChanged(
  newNode: NodeWithRef,
  currentNode: NodeWithRef | null
) {
  const addNode = !currentNode || newNode.nodeType !== currentNode.nodeType;
  if (addNode) {
    if (currentNode) {
      // Remove existing node
      deleteNode(currentNode);
    }
    // Build the new audio node
    newNode.audioNode = buildAudioNode(newNode);
  } else {
    newNode.audioNode = currentNode.audioNode;
  }
  applyPropUpdates(newNode, currentNode);
}

/// Recursively iterates over the children of newNode and currentNode and adds or
/// removes AudioNodes from the tree to satisfy the requested state.
function compareAndUpdateChildren(
  newNode: NodeWithRef,
  currentNode: NodeWithRef | null
) {
  // Find and add new children
  if (newNode.children) {
    const parentAudioNode = newNode.audioNode;
    newNode.children.forEach((newChild: Node, index: number) => {
      const currentNodeExistsAtIndex =
        currentNode?.children && index < currentNode.children.length;
      const typesAreEqual =
        currentNodeExistsAtIndex &&
        newChild.nodeType === currentNode!.children![index].nodeType;
      if (typesAreEqual) {
        // buildAudioGraph() will update any props that may have changed
        buildAudioGraph(
          newChild as NodeWithRef,
          currentNode.children![index] as NodeWithRef
        );
      } else {
        if (currentNodeExistsAtIndex) {
          // Delete the existing node
          deleteNode(currentNode.children![index] as NodeWithRef);
        }
        // Pass null for the current node to force buildAudioGraph() to build
        // a new subtree and AudioNode starting at newChild
        const audioNode = buildAudioGraph(newChild as NodeWithRef, null);
        if (audioNode) {
          if (parentAudioNode) {
            audioNode.connect(parentAudioNode);
          }
        } else {
          console.warn(
            `Parent node was unexpectedly missing. Unable to connect ${newChild.nodeType} node to graph`
          );
        }
      }
    });
  }

  // Delete removed children
  const numNewChildren = newNode.children ? newNode.children.length : 0;
  if (
    currentNode &&
    currentNode.children &&
    currentNode.children.length > numNewChildren
  ) {
    // Delete any children that are no longer in the child array
    for (let i = numNewChildren; i < currentNode.children!.length; ++i) {
      deleteNode(currentNode.children![i] as NodeWithRef);
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
function buildAudioGraph(
  newNode: NodeWithRef,
  currentNode: NodeWithRef | null
): AudioNode | null {
  updateOrReplaceNodeIfChanged(newNode, currentNode);
  // Note: compareAndUpdateChildren() will recursively call buildAudioGraph() for child nodes
  // to build out the entire tree.
  compareAndUpdateChildren(newNode, currentNode);
  return newNode.audioNode;
}

/// Renders the tree rooted in `newRoot` by comparing it to the current tree and applying
/// the minimum number of WebAudio node operations to fulfill the requested state.
export function render(newRoot: Node) {
  buildAudioGraph(newRoot as NodeWithRef, currentRoot);
  currentRoot = produce(currentRoot, () => newRoot);
  if (context.state !== "running") {
    start();
  }
}

function instantiateGenerators(root: NodeWithRef, time: number) {
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
      const dest = root.audioNode;
      if (!dest) {
        console.error(
          "Missing parent node to connect to. Some audio will not be generated"
        );
      } else {
        oscNode.connect(dest);
      }
    }
    instantiateGenerators(child as NodeWithRef, time);
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
