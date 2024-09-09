import { Mood } from "audio/melodicConstants";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import {
  generateChordProgression,
  getRandomMood,
  getRandomNote,
} from "audio/sequenceGenerator";
import { useSetAtom } from "jotai";
import { chordProgressionAtom, isPlayingAtom, melodyAtom } from "state";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewSong() {
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const setMelody = useSetAtom(melodyAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return (mood: Mood | null) => {
    const chordProgression = generateChordProgression({
      rootNote: getRandomNote(),
      mood: mood ?? getRandomMood(),
      notesPerChord: 4,
      octave: 3,
    });
    setChordProgression(chordProgression);
    renderAudioGraph({ progression: chordProgression });
    setIsPlaying(true);

    generateMelodyForChordProgression(
      chordProgression.chordNames,
      chordProgression.scale,
      chordProgression.rootNote,
    ).then((seq) => {
      setMelody(seq ?? null);
      renderAudioGraph({ progression: chordProgression, melody: seq });
    });
  };
}
