import { OscProps, SequencerEvent } from "audio/audioGraph";
import { Mood } from "audio/melodicConstants";
import { ChordProgression } from "audio/sequenceGenerator";
import { atom } from "jotai";

export const isPlayingAtom = atom(false);

export const chordProgressionAtom = atom<ChordProgression | null>(null);

export interface SynthParams extends OscProps {
  filterFrequency: number;
  filterQ: number;
  attack: number;
  decay: number;
  sustain: number;
  delayParams: DelayParams;
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

export const harmonySynthParamsAtom = atom<SynthParams>({
  type: "square",
  detune: 0,
  filterFrequency: 900,
  filterQ: 2,
  attack: 0.3,
  decay: 0.9,
  sustain: 0.2,
  delayParams: { ...defaultDelayParams },
});

export const melodySynthParamsAtom = atom<SynthParams>({
  type: "sawtooth",
  detune: 0,
  filterFrequency: 3500,
  filterQ: 4,
  attack: 0.01,
  decay: 0.1,
  sustain: 0.1,
  delayParams: { ...defaultDelayParams },
});

export const melodyAtom = atom<SequencerEvent[] | null>(null);

export const moodAtom = atom<Mood | null>(null);

export const selectedInstrumentAtom = atom<"harmony" | "melody">("harmony");
