import { ADSR, ADSRProps } from "./adsr";
import { LFO } from "./lfo";
import { Reverb, ReverbProps } from "./reverb";
import { Sequencer } from "./sequencer";

export type NodeType =
  | "osc"
  | "sample"
  | "lfo"
  | "filter"
  | "sequencer"
  | "destination"
  | "mul"
  | "adsr"
  | "delay"
  | "reverb"
  | "master-clipper";

interface BaseNode {
  children?: Node[];
  type: NodeType;
  key?: string;
  parent?: Node;
  auxConnections?: string[];
}

export interface ModInfo {
  key: string;
  amount: number;
}

export interface OscProps {
  type: OscillatorType;
  detune: number;
  modSources?: {
    gain?: ModInfo[];
    frequency?: ModInfo[];
  };
}

export interface OscNode extends BaseNode {
  type: "osc";
  props: OscProps;
  backingNode?: OscillatorNode;
}

export interface SampleProps {
  sampleId: string;
  lengthMs: number;
}

export interface SampleNode extends BaseNode {
  type: "sample";
  props: SampleProps;
  backingNode?: AudioBufferSourceNode;
}

export interface LFOProps {
  type: OscillatorType;
  frequency: number;
}

export interface LFONode extends BaseNode {
  type: "lfo";
  props: LFOProps;
  backingNode?: LFO;
}

export interface FilterProps {
  type: BiquadFilterType;
  frequency: number;
  q: number;
  modSources?: {
    frequency?: ModInfo[];
  };
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
  modSources?: {
    time?: ModInfo[];
  };
}

export interface FeedbackDelayNode extends BaseNode {
  type: "delay";
  props: FeedbackDelayProps;
  backingNode?: AudioNode;
}

export interface ReverbNode extends BaseNode {
  type: "reverb";
  props: ReverbProps;
  backingNode?: Reverb;
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
  | LFONode
  | FilterNode
  | ReverbNode
  | SampleNode
  | SequencerNode
  | DestinationNode
  | MulNode
  | ADSRNode
  | FeedbackDelayNode
  | MasterClipperNode;
