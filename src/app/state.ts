import { atom } from "jotai";

export interface NodeState {
  x: number;
  y: number;
  id: string;
  type: string;
}

export const nodesAtom = atom<NodeState[]>([]);

export type CursorMode = "selection" | "osc" | "filter";
export const cursorModeAtom = atom<CursorMode>("selection");
