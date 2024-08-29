import { OscProps, SequencerEvent } from "audio/audioGraph";
import { ChordProgression } from "audio/sequenceGenerator";
import { atom } from "jotai";

export const isPlayingAtom = atom(false);

export const chordProgressionAtom = atom<ChordProgression | null>(null);

export interface SynthParams extends OscProps {
  filterFrequency: number;
}
export const harmonySynthParamsAtom = atom<SynthParams>({
  type: "sine",
  detune: 0,
  filterFrequency: 700,
});

export const melodyAtom = atom<SequencerEvent[] | null>(null);
