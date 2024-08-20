"use client";

import { NodeType } from "audio/audioGraph";
import { defaultPropsForType } from "audio/nodes";
import { Connection } from "common/components/Connection";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useUpdateAudioGraphOnStateChange } from "common/hooks/useUpdateAudioGraphOnStateChange";
import { Oscillator } from "components/Oscillator";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  connectionsAtom,
  cursorModeAtom,
  nodePositionsAtom,
  nodesAtom,
  setNodePositionAtom,
} from "state";
import { uniqueId } from "utils";
import { CursorModeSelector } from "./CursorModeSelector";
import { DestinationNode } from "./DestinationNode";
import { Filter } from "./Filter";
import { SequencerNode } from "./SequencerNode";
import { TransportButton } from "./TransportButton";

export function AudioGraph() {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [cursorMode, setCursorMode] = useAtom(cursorModeAtom);
  const connections = useAtomValue(connectionsAtom);
  const nodePositions = useAtomValue(nodePositionsAtom);
  const setNodePosition = useSetAtom(setNodePositionAtom);
  useSetupHotkeys();
  useUpdateAudioGraphOnStateChange();

  const addNode = ({
    x,
    y,
    type,
    props,
  }: {
    x: number;
    y: number;
    type: NodeType;
    props: any;
  }) => {
    const key = uniqueId();
    setNodePosition({ key, x, y });
    setNodes((nodes) => [
      ...nodes,
      {
        type,
        key,
        props,
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
    addNode({ x: e.pageX, y: e.pageY, type, props: defaultPropsForType(type) });
    setCursorMode("selection");
  };

  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 bg-indigo-950"
      style={{ cursor }}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <TransportButton />
      <ul>
        {nodes.map((nodeState) => {
          if (!nodeState.key) {
            throw new Error("Missing key for node");
          }
          const { x, y } = nodePositions[nodeState.key!];
          const props = {
            x,
            y,
            key: nodeState.key,
            nodeId: nodeState.key,
            props: nodeState.props,
          };
          switch (nodeState.type) {
            case "osc":
              return <Oscillator {...props} />;
            case "filter":
              return <Filter {...props} />;
            case "destination":
              return <DestinationNode {...props} />;
            case "sequencer":
              return <SequencerNode {...props} />;
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
