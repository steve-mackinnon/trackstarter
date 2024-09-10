import { removeFlatChords } from "audio/melodicUtils";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { ChordProgression } from "audio/sequenceGenerator";
import { useAtomValue, useSetAtom } from "jotai";
import { chordProgressionAtom, melodyAtom, melodyLoadingAtom } from "state";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewMelody() {
  const chordProgressionState = useAtomValue(chordProgressionAtom);
  const setMelody = useSetAtom(melodyAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const setMelodyLoading = useSetAtom(melodyLoadingAtom);

  return async ({
    chordProgression,
    restartPlayback,
  }: {
    chordProgression?: ChordProgression;
    restartPlayback: boolean;
  }) => {
    chordProgression =
      chordProgression ??
      (chordProgressionState ? chordProgressionState : undefined);
    if (!chordProgression) {
      return;
    }
    setMelodyLoading(true);
    const progressionWithoutFlats = removeFlatChords(chordProgression);
    try {
      const melodySeq = await generateMelodyForChordProgression(
        progressionWithoutFlats.chordNames,
        progressionWithoutFlats.scale,
        progressionWithoutFlats.rootNote,
      );
      setMelody(melodySeq ?? null);
      renderAudioGraph({
        progression: chordProgression,
        melody: melodySeq,
        restartPlayback,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setMelodyLoading(false);
    }
  };
}
