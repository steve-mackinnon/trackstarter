"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { render as renderAudioGraph } from "../audio/audioGraph";
import { filter, osc, output, sequencer } from "../audio/nodes";
import { Oscillator } from "./Oscillator";
import { uniqueId } from "../utils";
import { useAtom } from "jotai";
import { nodesAtom } from "../state";

const audioGraph = (frequency: number, type: "lowpass" | "highpass") =>
  output({}, [
    sequencer({ rate: "8n", transposition: 0, destinationNodes: ["sineosc"] }),
    filter({ type, frequency, q: 1.7 }, [
      osc({ type: "sine", frequency: 100 }, [], "sineosc"),
      osc({ type: "square", frequency: 300 }),
    ]),
  ]);

export function AudioGraph() {
  const [nodes, setNodes] = useAtom(nodesAtom);

  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 bg-red-300"
      onMouseDown={(e) => {
        setNodes((nodes) => [
          ...nodes,
          {
            x: e.pageX,
            y: e.pageY,
            type: "osc",
            id: uniqueId(),
          },
        ]);
      }}
    >
      <ul>
        {nodes.map((nodeState) => (
          <Oscillator {...nodeState} key={nodeState.id} />
        ))}
      </ul>
    </div>
  );
}
