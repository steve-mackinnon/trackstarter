import { ADSRProps } from "./adsr";
import {
  ADSRNode,
  FeedbackDelayNode,
  FeedbackDelayProps,
  FilterNode,
  FilterProps,
  LFONode,
  LFOProps,
  MasterClipperNode,
  MulNode,
  MulProps,
  Node,
  OscNode,
  OscProps,
  SampleNode,
  SampleProps,
  SequencerNode,
  SequencerProps,
} from "./webAudioNodes";

type WithCommonProps<T> = T & { key?: string; auxOutputs?: string[] };
type WithKey<T> = T & { key?: string };

export function output(children: Node[]): Node {
  return {
    type: "destination",
    props: undefined,
    children,
  };
}

export function osc(props: WithCommonProps<OscProps>): OscNode {
  return {
    type: "osc",
    props,
    children: [],
    key: props.key,
    auxConnections: props.auxOutputs,
  };
}

export function sample(props: WithCommonProps<SampleProps>): SampleNode {
  return {
    type: "sample",
    props,
    children: [],
    key: props.key,
    auxConnections: props.auxOutputs,
  };
}

export function lfo(props: WithKey<LFOProps>): LFONode {
  return {
    type: "lfo",
    props,
    children: [],
    key: props.key,
  };
}

export function mul(
  props: WithCommonProps<MulProps>,
  children: Node[],
): MulNode {
  return {
    type: "mul",
    props,
    children,
    key: props.key,
    auxConnections: props.auxOutputs,
  };
}

export function filter(
  props: WithCommonProps<FilterProps>,
  children: Node[],
): FilterNode {
  return {
    type: "filter",
    props,
    children,
    key: props.key,
    auxConnections: props.auxOutputs ?? [],
  };
}

export function sequencer(props: WithKey<SequencerProps>): SequencerNode {
  return {
    type: "sequencer",
    props,
    children: [],
    key: props.key,
  };
}

export function adsr(props: WithCommonProps<ADSRProps>): ADSRNode {
  return {
    type: "adsr",
    props,
    children: [],
    key: props.key,
    auxConnections: props.auxOutputs,
  };
}

export function clipper(
  props: WithCommonProps<{}>,
  children: Node[],
): MasterClipperNode {
  return {
    type: "master-clipper",
    props: undefined,
    children,
    key: props.key,
    auxConnections: props.auxOutputs,
  };
}

export function delay(
  props: WithCommonProps<FeedbackDelayProps>,
  children: Node[],
): FeedbackDelayNode {
  return {
    type: "delay",
    props,
    children,
    key: props.key,
    auxConnections: props.auxOutputs,
  };
}
