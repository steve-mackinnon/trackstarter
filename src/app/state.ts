import { OscProps, SequencerEvent } from "audio/audioGraph";
import { ChordProgression } from "audio/sequenceGenerator";
import { atom } from "jotai";

export const isPlayingAtom = atom(false);

export const chordProgressionAtom = atom<ChordProgression | null>(null);
export const harmonySynthParamsAtom = atom<OscProps>({
  type: "sine",
  detune: 0,
});

export const melodyAtom = atom<SequencerEvent[] | null>(null);
