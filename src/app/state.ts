import { atom } from "jotai";

export interface NodeState {
  x: number;
  y: number;
  id: string;
  type: string;
}

export const nodesAtom = atom<NodeState[]>([]);
export const updateNodePositionAtom = atom(
  (get) => null,
  (get, set, { id, x, y }: { id: string; x: number; y: number }) => {
    const nodes = get(nodesAtom);
    const index = nodes.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error(`Failed to find node with id: ${id}`);
    }
    nodes[index] = { ...nodes[index], x, y, id };
    set(nodesAtom, [...nodes]);
  }
);

export type CursorMode = "selection" | "osc" | "filter" | "add-connection";
const cursorModeStorageAtom = atom<CursorMode>("selection");
export const cursorModeAtom = atom(
  (get) => get(cursorModeStorageAtom),
  (_, set, value: CursorMode) => {
    if (value !== "add-connection") {
      set(connectionSourceNodeAtom, null);
    }
    set(cursorModeStorageAtom, value);
  }
);

export const connectionSourceNodeAtom = atom<string | null>(null);

export const connectionsAtom = atom<{ [key: string]: string[] }>({});
export const addConnectionAtom = atom(
  (get) => get(connectionsAtom),
  (
    get,
    set,
    { nodeId, connectionNodeId }: { nodeId: string; connectionNodeId: string }
  ) => {
    const current = get(connectionsAtom);
    const updated = { ...current };
    // Don't add a duplicate connection
    if (
      updated[nodeId] &&
      updated[nodeId].find((n) => n === connectionNodeId)
    ) {
      return;
    }
    updated[nodeId] = [...(updated[nodeId] || []), connectionNodeId];
    set(connectionsAtom, updated);
  }
);
