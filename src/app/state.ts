import { atom } from "jotai";

export interface NodeState {
  x: number;
  y: number;
  id: string;
  type: string;
}

export const nodesAtom = atom<NodeState[]>([]);

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
