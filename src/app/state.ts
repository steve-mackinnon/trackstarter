import { OscProps, SequencerEvent } from "audio/audioGraph";
import { ChordProgression, Mood } from "audio/sequenceGenerator";
import { atom } from "jotai";

export const isPlayingAtom = atom(false);

export const chordProgressionAtom = atom<ChordProgression | null>(null);

export interface SynthParams extends OscProps {
  filterFrequency: number;
  filterQ: number;
}
export const harmonySynthParamsAtom = atom<SynthParams>({
  type: "sine",
  detune: 0,
  filterFrequency: 700,
  filterQ: 0.707,
});

export const melodySynthParamsAtom = atom<SynthParams>({
  type: "sawtooth",
  detune: 0,
  filterFrequency: 2000,
  filterQ: 3,
});

export const melodyAtom = atom<SequencerEvent[] | null>(null);

export const moodAtom = atom<Mood | null>(null);

export const selectedInstrumentAtom = atom<"harmony" | "melody">("harmony");
