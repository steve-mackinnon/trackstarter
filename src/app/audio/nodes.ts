import { FilterNode, FilterProps, Node, OscNode, OscProps } from "./audioGraph";

export function output(props: any, children?: Node[]): Node {
  return {
    type: "destination",
    props,
    children,
  };
}

export function osc(props: OscProps, children?: Node[]): OscNode {
  return {
    type: "osc",
    props,
    children,
  };
}

export function filter(props: FilterProps, children?: Node[]): FilterNode {
  return {
    type: "filter",
    props,
    children,
  };
}
