import { ADSR, ADSRProps } from "./adsr";
import { Sequencer } from "./sequencer";

export type NodeType =
  | "osc"
  | "filter"
  | "sequencer"
  | "destination"
  | "mul"
  | "adsr"
  | "delay"
  | "master-clipper";

interface BaseNode {
  children?: Node[];
  type: NodeType;
  key?: string;
  parent?: Node;
  auxConnections?: string[];
}

export interface OscProps {
  type: OscillatorType;
  detune: number;
  modSources?: {
    gain?: string[];
    frequency?: string[];
  };
}

export interface OscNode extends BaseNode {
  type: "osc";
  props: OscProps;
  backingNode?: OscillatorNode;
}

export interface FilterProps {
  type: BiquadFilterType;
  frequency: number;
  q: number;
}
export interface FilterNode extends BaseNode {
  type: "filter";
  props: FilterProps;
  backingNode?: BiquadFilterNode;
  auxConnections: string[];
}

export interface MulProps {
  multiplier: number;
}
export interface MulNode extends BaseNode {
  type: "mul";
  props: MulProps;
  backingNode?: GainNode;
}

export interface ADSRNode extends BaseNode {
  type: "adsr";
  props: ADSRProps;
  backingNode?: ADSR;
}

export interface FeedbackDelayProps {
  feedback: number;
  time: number;
}

export interface FeedbackDelayNode extends BaseNode {
  type: "delay";
  props: FeedbackDelayProps;
  backingNode?: AudioNode;
}

export interface MasterClipperNode extends BaseNode {
  type: "master-clipper";
  props: undefined;
  backingNode?: AudioNode;
}

export interface DestinationNode extends BaseNode {
  type: "destination";
  props: any;
  backingNode?: never;
}

export interface SequencerEvent {
  note: string;
  startStep: number;
  endStep: number;
}

export interface SequencerProps {
  destinationNodes: string[];
  length: number;
  // Ordered list of notes to play in the sequence. If notes.length()
  // is smaller than length, the sequence will wrap until the sequence
  // restarts.
  notes: SequencerEvent[];
}

export interface SequencerNode extends BaseNode {
  type: "sequencer";
  props: SequencerProps;
  backingNode?: Sequencer;
}

export type Node =
  | OscNode
  | FilterNode
  | SequencerNode
  | DestinationNode
  | MulNode
  | ADSRNode
  | FeedbackDelayNode
  | MasterClipperNode;
