import * as Tone from "tone";

const context = new AudioContext();

export interface Node {
  children?: Node[];
  id: number;
  nodeType: "osc" | "filter" | "destination";
  props?: Object;
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

let currentRoot: Node | undefined;
let nodeStore = new Map<number, AudioNode>();

// export function updateState(root: Node) {
//   if (oldRoot === undefined) {
//     oldRoot = root;
//     return;
//   }
// }

function buildNode(node: Node): AudioNode | null {
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

function buildAudioNodes(root: Node) {
  const parent = buildNode(root);
  if (parent) {
    nodeStore.set(root.id, parent);
  }
  if (root.children) {
    for (const childNode of root.children) {
      const child = buildAudioNodes(childNode);
      if (child && parent) {
        child.connect(parent);
      }
    }
  }
  return parent;
}

export function renderAudioGraph(root: Node) {
  buildAudioNodes(root);
  currentRoot = root;
  start();
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
