import { Node } from "audio/audioGraph";
import { produce } from "immer";
import { atom } from "jotai";

export const nodesAtom = atom<Node[]>([
  { key: "dest", type: "destination", props: undefined },
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
  },
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
  },
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
  },
);

export const updateNodeStateAtom = atom(
  (get) => null,
  (get, set, { key, props }: { key: string; props: any }) => {
    let nodes = get(nodesAtom);
    const nodeIndex = nodes.findIndex((n) => n.key === key);
    if (nodeIndex === -1) {
      throw new Error(`Unable to find node with key ${key}`);
    }
    nodes = produce(nodes, (n) => {
      n[nodeIndex].props = { ...props };
    });
    set(nodesAtom, nodes);
  },
);
