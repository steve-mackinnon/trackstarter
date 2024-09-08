import { ADSRProps } from "./adsr";
import {
  ADSRNode,
  FeedbackDelayNode,
  FilterNode,
  FilterProps,
  MasterClipperNode,
  MulNode,
  MulProps,
  Node,
  NodeType,
  OscNode,
  OscProps,
  SequencerNode,
  SequencerProps,
} from "./audioGraph";
import { FeedbackDelayProps } from "./feedbackDelay";

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

export function mul(props: MulProps, children: Node[], key?: string): MulNode {
  return {
    type: "mul",
    props,
    children,
    key,
  };
}

export function filter(
  props: FilterProps,
  children: Node[],
  auxConnections: string[],
  key?: string,
): FilterNode {
  return {
    type: "filter",
    props,
    children,
    key,
    auxConnections,
  };
}

export function sequencer(props: SequencerProps, key?: string): SequencerNode {
  return {
    type: "sequencer",
    props,
    children: [],
    key,
  };
}

export function adsr(props: ADSRProps, key?: string): ADSRNode {
  return {
    type: "adsr",
    props,
    children: [],
    key,
  };
}

export function masterClipper(children: Node[]): MasterClipperNode {
  return {
    type: "master-clipper",
    props: undefined,
    children,
  };
}

export function delay(
  props: FeedbackDelayProps,
  children: Node[],
  key?: string,
): FeedbackDelayNode {
  return {
    type: "delay",
    props,
    children,
    key,
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
    octave: 3,
    probability: 1,
    notes: ["D2", "D#2", "F1", "G3", "F2", "F2", "D#1", "C#2"],
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
