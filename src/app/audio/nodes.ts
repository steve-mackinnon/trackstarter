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

export function output(props: any, children: Node[]): Node {
  return {
    type: "destination",
    props,
    children,
  };
}

export function osc(props: OscProps, children: Node[], key?: string): OscNode {
  return {
    type: "osc",
    props,
    children,
    key,
  };
}

export function filter(props: FilterProps, children: Node[]): FilterNode {
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
    children: [],
  };
}

export function canNodesConnect(sourceType: NodeType, destType: NodeType) {
  switch (destType) {
    case "destination":
    case "filter":
      return true;
    case "osc": {
      return sourceType === "sequencer";
    }
    case "sequencer":
      return false;
  }
}

export function defaultOscProps(): OscProps {
  return {
    type: "sawtooth",
    detune: 0,
  };
}

export function defaultFilterProps(): FilterProps {
  return {
    type: "lowpass",
    frequency: 900,
    q: 0.707,
  };
}

export function defaultSequencerProps(): SequencerProps {
  return {
    rate: "16n",
    transposition: 0,
    destinationNodes: [],
    steps: 3,
    length: 16,
    rootNote: "C",
    octave: 3,
    probability: 1,
  };
}

export function defaultPropsForType(type: NodeType) {
  switch (type) {
    case "filter":
      return defaultFilterProps();
    case "osc":
      return defaultOscProps();
    case "sequencer":
      return defaultSequencerProps();
  }
}
