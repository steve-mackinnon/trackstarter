import {
  FilterNode,
  FilterProps,
  Node,
  NodeType,
  OscNode,
  OscProps,
  SequencerNode,
  SequencerProps,
} from "./audioGraph";

export function output(props: any, children?: Node[]): Node {
  return {
    type: "destination",
    props,
    children,
  };
}

export function osc(props: OscProps, children?: Node[], key?: string): OscNode {
  return {
    type: "osc",
    props,
    children,
    key,
  };
}

export function filter(props: FilterProps, children?: Node[]): FilterNode {
  return {
    type: "filter",
    props,
    children,
  };
}

export function sequencer(props: SequencerProps): SequencerNode {
  return {
    type: "sequencer",
    props,
  };
}

export function nodeAcceptsConnections(type: NodeType) {
  switch (type) {
    case "destination":
    case "filter":
      return true;
    case "osc":
    case "sequencer":
      return false;
  }
}
