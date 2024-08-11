import * as Tone from "tone";

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

// export function updateState(root: Node) {
//   if (oldRoot === undefined) {
//     oldRoot = root;
//     return;
//   }
// }

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

function buildAudioGraph(
  newRoot: Node,
  currentRoot: Node | null
): AudioNode | null {
  let shouldReplaceNode = !currentRoot || newRoot.id != currentRoot.id;
  if (shouldReplaceNode) {
    if (currentRoot) {
      // Remove existing node
      deleteNode(currentRoot);
      // Update the ref to point to the new node
      currentRoot.id = newRoot.id;
      currentRoot.children = structuredClone(newRoot.children);
      currentRoot.nodeType = newRoot.nodeType;
      currentRoot.props = structuredClone(newRoot.props);
    }

    // Build the new audio node
    const audioNode = buildAudioNode(newRoot);
    if (audioNode) {
      nodeStore.set(newRoot.id, audioNode);
    }
    // Rebuild all of the children
    if (newRoot.children) {
      for (const child of newRoot.children) {
        const newChild = buildAudioGraph(child, null);
        if (newChild && audioNode) {
          newChild.connect(audioNode);
        }
      }
    }
    return audioNode;
  }
  // Add newly added children
  if (newRoot.children) {
    const parentAudioNode = nodeStore.get(newRoot.id)!;
    for (const newChild of newRoot.children) {
      // Look for a match of the child's id in the current child array
      const currentChild = currentRoot?.children?.find(
        (n) => n.id === newChild.id
      );
      const childAudioNode = (() => {
        if (!currentChild) {
          return buildAudioGraph(newChild, null);
        } else {
          return buildAudioGraph(newChild, currentChild);
        }
      })();
      if (childAudioNode && parentAudioNode) {
        childAudioNode.connect(parentAudioNode);
      }
    }
  }
  // Delete removed children
  if (currentRoot && currentRoot.children) {
    for (const childNode of currentRoot.children) {
      // Is this node missing from the new node's child array?
      if (
        !newRoot.children ||
        (newRoot.children &&
          !newRoot.children.find((n) => n.id === childNode.id))
      ) {
        deleteNode(childNode);
      }
    }
  }
  const node = nodeStore.get(newRoot.id) ?? null;
  return node;
}

let started = false;
export function renderAudioGraph(newRoot: Node) {
  buildAudioGraph(newRoot, currentRoot);
  currentRoot = structuredClone(newRoot);
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
