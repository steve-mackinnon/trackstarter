"use client";

import { Oscillator } from "./Oscillator";
import { uniqueId } from "../utils";
import { useAtom } from "jotai";
import { nodesAtom } from "../state";

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
      className="absolute top-0 bottom-0 left-0 right-0 bg-red-300"
      onMouseDown={(e) => addNode({ x: e.pageX, y: e.pageY })}
    >
      <ul>
        {nodes.map((nodeState) => (
          <Oscillator {...nodeState} key={nodeState.id} />
        ))}
      </ul>
    </div>
  );
}
