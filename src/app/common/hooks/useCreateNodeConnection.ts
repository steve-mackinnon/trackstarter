import { NodeType } from "audio/audioGraph";
import { canNodesConnect } from "audio/nodes";
import { produce } from "immer";
import { useAtom, useSetAtom } from "jotai";
import {
  addConnectionAtom,
  connectionSourceNodeAtom,
  cursorModeAtom,
  nodesAtom,
} from "state";

export function useCreateNodeConnection() {
  const [connectionSource, setConnectionSource] = useAtom(
    connectionSourceNodeAtom
  );
  const [_, addConnection] = useAtom(addConnectionAtom);
  const setCursorMode = useSetAtom(cursorModeAtom);

  const [nodes, setNodes] = useAtom(nodesAtom);
  const getNodeType = (id: string): NodeType => {
    const node = nodes.find((n) => n.key === id);
    if (!node) {
      throw new Error(`Failed to find node with id: ${id}`);
    }
    return node.type as NodeType;
  };
  return (destNode: string) => {
    if (!connectionSource || connectionSource === destNode) {
      return false;
    }
    const sourceType = getNodeType(connectionSource);
    if (canNodesConnect(sourceType, getNodeType(destNode))) {
      if (sourceType === "sequencer") {
        // For sequencer nodes, connections are represented via destinationNodes prop
        const seqNodeIndex = nodes.findIndex((n) => n.key === connectionSource);
        if (seqNodeIndex === -1) {
          throw new Error("Failed to find sequencer node");
        }
        const newNodes = produce(nodes, (n) => {
          if (n[seqNodeIndex].props.destinationNodes) {
            n[seqNodeIndex].props.destinationNodes.push(destNode);
          } else {
            n[seqNodeIndex].props.destinationNodes = [destNode];
          }
        });
        setNodes(newNodes);
      }
      addConnection({ sourceId: connectionSource, destId: destNode });
      setConnectionSource(null);
      setCursorMode("selection");
      return true;
    }
  };
}
