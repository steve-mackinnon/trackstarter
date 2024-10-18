import { removeFlatChords } from "audio/melodicUtils";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { ChordProgression } from "audio/sequenceGenerator";
import { SequencerEvent } from "audio/webAudioNodes";
import { useAtomValue, useSetAtom } from "jotai";
import { chordProgressionAtom, melodyAtom, melodyLoadingAtom } from "state";

export function useGenerateNewMelody() {
  const chordProgressionState = useAtomValue(chordProgressionAtom);
  const setMelody = useSetAtom(melodyAtom);
  const setMelodyLoading = useSetAtom(melodyLoadingAtom);

  return async ({
    chordProgression,
  }: {
    chordProgression?: ChordProgression;
  }) => {
    chordProgression =
      chordProgression ??
      (chordProgressionState && !Array.isArray(chordProgressionState)
        ? chordProgressionState
        : undefined);
    if (!chordProgression) {
      return;
    }
    setMelodyLoading(true);
    let melodySeq: SequencerEvent[] | undefined;
    const progressionWithoutFlats = removeFlatChords(chordProgression);
    try {
      melodySeq = await generateMelodyForChordProgression(
        progressionWithoutFlats.chordNames,
        progressionWithoutFlats.scale,
        progressionWithoutFlats.rootNote,
      );
      setMelody(melodySeq ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setMelodyLoading(false);
    }
    return melodySeq;
  };
}
