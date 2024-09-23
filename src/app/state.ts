import { Mood } from "audio/melodicConstants";
import { ChordProgression } from "audio/sequenceGenerator";
import { OscProps, SequencerEvent } from "audio/webAudioNodes";
import { atom } from "jotai";

const defaultKickPattern: SequencerEvent[] = Array.from({ length: 8 }).map(
  (_, index) => {
    return {
      note: "C3",
      startStep: index * 8,
      endStep: index * 8 + 1,
    };
  },
);
const defaultSnarePattern: SequencerEvent[] = Array.from({ length: 4 }).map(
  (_, index) => {
    return {
      note: "C3",
      startStep: index * 16 + 8,
      endStep: index * 16 + 9,
    };
  },
);
const defaultClosedHHPattern: SequencerEvent[] = Array.from({ length: 32 }).map(
  (_, index) => {
    return {
      note: "C3",
      startStep: index * 4,
      endStep: index * 4 + 1,
    };
  },
);
export const isPlayingAtom = atom(false);

export const chordProgressionAtom = atom<ChordProgression | null>(null);
export const chordProgressionLoadingAtom = atom(false);

export const melodyAtom = atom<SequencerEvent[] | null>(null);
export const melodyLoadingAtom = atom(false);

export const kickPatternAtom = atom<SequencerEvent[] | null>(
  defaultKickPattern,
);
export const snarePatternAtom = atom<SequencerEvent[] | null>(
  defaultSnarePattern,
);
export const closedHHPatternAtom = atom<SequencerEvent[] | null>(
  defaultClosedHHPattern,
);

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
  attack: 0.01,
  decay: 0.8,
  release: 0.6,
  sustain: 0.0,
  delayParams: { ...defaultDelayParams },
  gain: 0.25,
});
