import { NodeType } from "audio/audioGraph";
import { produce } from "immer";
import { atom } from "jotai";

export interface NodeState {
  key: string;
  type: NodeType;
  props?: any;
}

export const nodesAtom = atom<NodeState[]>([
  { key: "dest", type: "destination" },
]);

export const nodePositionsAtom = atom<{
  [key: string]: { x: number; y: number };
}>({ dest: { x: 100, y: 100 } });

export const setNodePositionAtom = atom(
  (get) => null,
  (get, set, { key, x, y }: { key: string; x: number; y: number }) => {
    let nodes = get(nodePositionsAtom);
    nodes = produce(nodes, (n) => {
      n[key] = { x, y };
    });
    set(nodePositionsAtom, nodes);
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
