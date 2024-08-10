"use client";

import {
  renderAudioGraph as renderAudioGraph,
  Node,
} from "../audio/audioEngine";

const root: Node = {
  id: 0,
  nodeType: "destination",
  children: [
    {
      id: 1,
      nodeType: "osc",
      props: {
        frequency: 200,
        type: "sine",
      },
      children: [],
    },
    {
      id: 2,
      nodeType: "osc",
      props: {
        frequency: 420,
        type: "sawtooth",
      },
      children: [],
    },
  ],
};
export function Sequencer() {
  return <button onClick={() => renderAudioGraph(root)}>Start</button>;
}
