"use client";

import { Oscillator } from "components/Oscillator";
import { useAtom } from "jotai";
import { cursorModeAtom, nodesAtom } from "state";
import { uniqueId } from "utils";
import { CursorModeSelector } from "./CursorModeSelector";
import { Filter } from "./Filter";

export function AudioGraph() {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [cursorMode, setCursorMode] = useAtom(cursorModeAtom);

  const addNode = ({
    x,
    y,
    type,
  }: {
    x: number;
    y: number;
    type: "osc" | "filter";
  }) => {
    setNodes((nodes) => [
      ...nodes,
      {
        x,
        y,
        type,
        id: uniqueId(),
      },
    ]);
  };

  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 bg-indigo-950"
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget || cursorMode === "selection") {
          // Ignore mouse clicks that originated from children
          return;
        }
        const type = (() => {
          switch (cursorMode) {
            case "filter":
              return "filter";
            case "osc":
              return "osc";
          }
        })();
        addNode({ x: e.pageX, y: e.pageY, type });
        setCursorMode("selection");
      }}
    >
      <ul>
        {nodes.map((nodeState) => {
          switch (nodeState.type) {
            case "osc":
              return <Oscillator {...nodeState} key={nodeState.id} />;
            case "filter":
              return <Filter {...nodeState} key={nodeState.id} />;
          }
        })}
      </ul>
      <CursorModeSelector className="absolute left-1/2 bottom-10" />
    </div>
  );
}
