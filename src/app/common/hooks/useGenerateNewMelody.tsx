import { removeFlatChords } from "audio/melodicUtils";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { useAtomValue, useSetAtom } from "jotai";
import { chordProgressionAtom, melodyAtom } from "state";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewMelody() {
  const chordProgression = useAtomValue(chordProgressionAtom);
  const setMelody = useSetAtom(melodyAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return () => {
    if (!chordProgression) {
      return;
    }
    const progressionWithoutFlats = removeFlatChords(chordProgression);
    generateMelodyForChordProgression(
      progressionWithoutFlats.chordNames,
      progressionWithoutFlats.scale,
      progressionWithoutFlats.rootNote,
    ).then((seq) => {
      setMelody(seq ?? null);
      renderAudioGraph({ progression: chordProgression, melody: seq });
    });
  };
}
