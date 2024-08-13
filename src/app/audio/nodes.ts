import { FilterNode, FilterProps, Node, OscNode, OscProps } from "./audioGraph";

export function output(props: any, children?: Node[]): Node {
  return {
    nodeType: "destination",
    props,
    children,
  };
}

export function osc(props: OscProps, children?: Node[]): OscNode {
  return {
    nodeType: "osc",
    props,
    children,
  };
}

export function filter(props: FilterProps, children?: Node[]): FilterNode {
  return {
    nodeType: "filter",
    props,
    children,
  };
}
