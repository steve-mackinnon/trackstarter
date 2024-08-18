"use client";

import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { Oscillator } from "components/Oscillator";
import { useAtom, useAtomValue } from "jotai";
import { connectionsAtom, cursorModeAtom, nodesAtom } from "state";
import { uniqueId } from "utils";
import { CursorModeSelector } from "./CursorModeSelector";
import { Filter } from "./Filter";

export function AudioGraph() {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [cursorMode, setCursorMode] = useAtom(cursorModeAtom);
  const connections = useAtomValue(connectionsAtom);
  useSetupHotkeys();

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

  const cursor = (() => {
    switch (cursorMode) {
      case "add-connection":
      case "osc":
      case "filter":
        return "copy";
      case "selection":
        return "default";
    }
  })();
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target !== e.currentTarget ||
      cursorMode === "selection" ||
      cursorMode === "add-connection"
    ) {
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
  };

  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 bg-indigo-950"
      style={{ cursor }}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <ul>
        {nodes.map((nodeState) => {
          switch (nodeState.type) {
            case "osc":
              return (
                <Oscillator
                  {...nodeState}
                  key={nodeState.id}
                  nodeId={nodeState.id}
                />
              );
            case "filter":
              return (
                <Filter
                  {...nodeState}
                  key={nodeState.id}
                  nodeId={nodeState.id}
                />
              );
          }
        })}
      </ul>
      <ul>
        {Object.keys(connections).map((nodeId: string) =>
          connections[nodeId].map((destNodeId) => (
            <div>
              {nodeId} - {destNodeId}
            </div>
          ))
        )}
      </ul>
      <CursorModeSelector className="absolute left-1/2 bottom-10" />
    </div>
  );
}
