import {
  DestinationNode,
  FilterNode,
  FilterProps,
  Node,
  OscNode,
  OscProps,
} from "./audioGraph";

export function output(id: number, props: any, children?: Node[]): Node {
  return {
    id,
    nodeType: "destination",
    props,
    children,
  };
}

export function osc(id: number, props: OscProps, children?: Node[]): OscNode {
  return {
    id,
    nodeType: "osc",
    props,
    children,
  };
}

export function filter(
  id: number,
  props: FilterProps,
  children?: Node[]
): FilterNode {
  return {
    id,
    nodeType: "filter",
    props,
    children,
  };
}
