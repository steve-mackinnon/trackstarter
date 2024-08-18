"use client";

import { NodeType } from "audio/audioGraph";
import { Connection } from "common/components/Connection";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useUpdateAudioGraphOnStateChange } from "common/hooks/useUpdateAudioGraphOnStateChange";
import { Oscillator } from "components/Oscillator";
import { useAtom, useAtomValue } from "jotai";
import { connectionsAtom, cursorModeAtom, nodesAtom } from "state";
import { uniqueId } from "utils";
import { CursorModeSelector } from "./CursorModeSelector";
import { DestinationNode } from "./DestinationNode";
import { Filter } from "./Filter";
import { SequencerNode } from "./SequencerNode";

export function AudioGraph() {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [cursorMode, setCursorMode] = useAtom(cursorModeAtom);
  const connections = useAtomValue(connectionsAtom);
  useSetupHotkeys();
  useUpdateAudioGraphOnStateChange();

  const addNode = ({
    x,
    y,
    type,
  }: {
    x: number;
    y: number;
    type: NodeType;
  }) => {
    setNodes((nodes) => [
      ...nodes,
      {
        x,
        y,
        type,
        key: uniqueId(),
      },
    ]);
  };

  const cursor = (() => {
    switch (cursorMode) {
      case "add-connection":
      case "osc":
      case "filter":
      case "sequencer":
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
        case "sequencer":
          return "sequencer";
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
                  key={nodeState.key}
                  nodeId={nodeState.key}
                />
              );
            case "filter":
              return (
                <Filter
                  {...nodeState}
                  key={nodeState.key}
                  nodeId={nodeState.key}
                />
              );
            case "destination":
              return (
                <DestinationNode
                  {...nodeState}
                  key={nodeState.key}
                  nodeId={nodeState.key}
                />
              );
            case "sequencer":
              return (
                <SequencerNode
                  {...nodeState}
                  key={nodeState.key}
                  nodeId={nodeState.key}
                />
              );
          }
        })}
      </ul>
      <ul>
        {Object.keys(connections).map((nodeId: string) =>
          connections[nodeId].map((destNodeId) => (
            <Connection
              source={nodeId}
              dest={destNodeId}
              key={`${nodeId}-${destNodeId}`}
            />
          ))
        )}
      </ul>
      <CursorModeSelector className="absolute left-1/2 bottom-10" />
    </div>
  );
}
