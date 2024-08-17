"use client";

import { Oscillator } from "components/Oscillator";
import { useAtom } from "jotai";
import { nodesAtom } from "state";
import { uniqueId } from "utils";
import { CursorModeSelector } from "./CursorModeSelector";

export function AudioGraph() {
  const [nodes, setNodes] = useAtom(nodesAtom);

  const addNode = ({ x, y }: { x: number; y: number }) => {
    setNodes((nodes) => [
      ...nodes,
      {
        x,
        y,
        type: "osc",
        id: uniqueId(),
      },
    ]);
  };

  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 bg-indigo-950"
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) {
          // Ignore mouse clicks that originated from children
          return;
        }
        addNode({ x: e.pageX, y: e.pageY });
      }}
    >
      <ul>
        {nodes.map((nodeState) => (
          <Oscillator {...nodeState} key={nodeState.id} />
        ))}
      </ul>
      <CursorModeSelector className="absolute left-1/2 bottom-10" />
    </div>
  );
}
