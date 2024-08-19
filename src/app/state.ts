import { NodeType } from "audio/audioGraph";
import { produce } from "immer";
import { atom } from "jotai";
import { uniqueId } from "utils";

export interface NodeState {
  x: number;
  y: number;
  key: string;
  type: NodeType;
  props?: any;
}

export const nodesAtom = atom<NodeState[]>([
  { x: 100, y: 0, key: uniqueId(), type: "destination" },
]);

export const updateNodePositionAtom = atom(
  (get) => null,
  (get, set, { id, x, y }: { id: string; x: number; y: number }) => {
    let nodes = get(nodesAtom);
    const index = nodes.findIndex((n) => n.key === id);
    if (index === -1) {
      throw new Error(`Failed to find node with id: ${id}`);
    }
    nodes = produce(nodes, (n) => {
      n[index] = { ...nodes[index], x, y, key: id };
    });
    set(nodesAtom, [...nodes]);
  }
);

export type CursorMode =
  | "selection"
  | "osc"
  | "filter"
  | "sequencer"
  | "add-connection";
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
  (get, set, { sourceId, destId }: { sourceId: string; destId: string }) => {
    const current = get(connectionsAtom);
    const updated = { ...current };
    // Don't add a duplicate connection
    if (updated[destId] && updated[destId].find((n) => n === sourceId)) {
      return;
    }
    updated[destId] = [...(updated[destId] || []), sourceId];
    set(connectionsAtom, updated);
  }
);
