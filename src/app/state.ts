import { atom } from "jotai";
import { selectAtom } from "jotai/utils";

export interface DragState {
  id: string;
  xOffset: number;
  yOffset: number;
}
export const activeDragAtom = atom<DragState | null>(null);

export interface NodeState {
  x: number;
  y: number;
  id: string;
  type: string;
}

export const nodesAtom = atom<NodeState[]>([]);

export const atomForNode = (key: string) =>
  selectAtom(nodesAtom, (nodes) => {
    const node = nodes.find((v) => v.id === key);
    if (!node) {
      throw new Error(`Unable to locate node with key ${key}`);
    }
    return node;
  });
