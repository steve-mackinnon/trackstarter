import { NodeType } from "audio/audioGraph";
import { canNodesConnect } from "audio/nodes";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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

  const nodes = useAtomValue(nodesAtom);
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
    if (canNodesConnect(getNodeType(connectionSource), getNodeType(destNode))) {
      addConnection({ sourceId: connectionSource, destId: destNode });
      setConnectionSource(null);
      setCursorMode("selection");
      return true;
    }
  };
}
