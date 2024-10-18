import { CoreMessage } from "ai";
import { Mood } from "audio/melodicConstants";
import { ChordProgression } from "audio/sequenceGenerator";
import { OscProps, SequencerEvent } from "audio/webAudioNodes";
import { atom } from "jotai";

export const isPlayingAtom = atom(false);

export const chordProgressionAtom = atom<
  ChordProgression | SequencerEvent[] | null
>(null);
export const chordProgressionLoadingAtom = atom(false);

export const melodyAtom = atom<SequencerEvent[] | null>(null);
export const melodyLoadingAtom = atom(false);

export interface DrumsParams {
  muted: boolean;
  patternGenIntensity: "low" | "medium" | "high";
  patternLength: number;
  kickPattern: SequencerEvent[];
  snarePattern: SequencerEvent[];
  openHHPattern: SequencerEvent[];
  closedHHPattern: SequencerEvent[];
  lowTomPattern: SequencerEvent[];
  midTomPattern: SequencerEvent[];
  highTomPattern: SequencerEvent[];
  // crashCymbalPattern: SequencerEvent[];
  rideCymbalPattern: SequencerEvent[];
}

export const drumsAtom = atom<DrumsParams>({
  muted: false,
  patternGenIntensity: "medium",
  patternLength: 64,
  kickPattern: [],
  snarePattern: [],
  openHHPattern: [],
  closedHHPattern: [],
  lowTomPattern: [],
  midTomPattern: [],
  highTomPattern: [],
  // crashCymbalPattern: [],
  rideCymbalPattern: [],
});
export const drumsLoadingAtom = atom(false);

export const moodAtom = atom<Mood | null>(null);

export const selectedInstrumentAtom = atom<"harmony" | "melody">("harmony");

interface LFOParams {
  rate: number;
  amount: number;
}

export interface SynthParams extends OscProps {
  filterFrequency: number;
  filterLFO: LFOParams;
  oscFrequencyLFO: LFOParams;
  filterQ: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  delayParams: DelayParams;
  gain: number;
}

export interface DelayParams {
  sendAmount: number;
  time: number;
  feedback: number;
  lpfFrequency: number;
}

const defaultDelayParams: DelayParams = {
  sendAmount: 0,
  time: 0.35,
  feedback: 0.6,
  lpfFrequency: 800,
};

const defaultLFOParams: LFOParams = {
  rate: 0.5,
  amount: 0,
};

export const harmonySynthParamsAtom = atom<SynthParams>({
  type: "square",
  detune: 0,
  filterFrequency: 1900,
  filterLFO: {
    rate: 0.03,
    amount: 100,
  },
  oscFrequencyLFO: { rate: 2.67, amount: 1 },
  filterQ: 2.5,
  attack: 0.3,
  decay: 0.9,
  sustain: 0.2,
  release: 0.45,
  delayParams: { ...defaultDelayParams },
  gain: 0.1,
});

export const melodySynthParamsAtom = atom<SynthParams>({
  type: "sawtooth",
  detune: 0,
  filterFrequency: 3500,
  filterLFO: { ...defaultLFOParams },
  oscFrequencyLFO: { ...defaultLFOParams },
  filterQ: 4,
  attack: 0.015,
  decay: 0.34,
  release: 0.4,
  sustain: 0.0,
  delayParams: { ...defaultDelayParams },
  gain: 0.25,
});

export const chatVisibleAtom = atom(false);
export const chatStateAtom = atom<CoreMessage[]>([]);
