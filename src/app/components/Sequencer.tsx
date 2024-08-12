"use client";

import { ChangeEvent, useState } from "react";
import { render as renderAudioGraph, Node } from "../audio/audioGraph";

const root: Node = {
  id: 0,
  nodeType: "destination",
  children: [
    {
      id: 3,
      nodeType: "filter",
      props: {
        frequency: 1000,
        type: "lowpass",
        q: 1.2,
      },
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
    },
  ],
};
const root2: Node = {
  id: 0,
  nodeType: "destination",
  children: [
    {
      id: 4,
      nodeType: "filter",
      props: {
        frequency: 1000,
        type: "highpass",
        q: 1.2,
      },
      children: [
        {
          id: 5,
          nodeType: "osc",
          props: {
            frequency: 100,
            type: "sine",
          },
          children: [],
        },
        {
          id: 6,
          nodeType: "osc",
          props: {
            frequency: 520,
            type: "sawtooth",
          },
          children: [],
        },
      ],
    },
  ],
};

export function Sequencer() {
  const [lowpassFreq, setLowpassFreq] = useState(1000);
  return (
    <>
      <input
        type="range"
        min={20}
        max={20000}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const freq = Number.parseFloat(e.target.value);
          root.children![0].props!.frequency = freq;
          renderAudioGraph(root);
        }}
        width={300}
      />
      <button onClick={() => renderAudioGraph(root)}>Start</button>{" "}
      <button onClick={() => renderAudioGraph(root2)}>Start 2</button>{" "}
    </>
  );
}
