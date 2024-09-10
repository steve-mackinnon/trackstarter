import { Mood } from "audio/melodicConstants";
import {
  generateChordProgression,
  getRandomMood,
  getRandomNote,
} from "audio/sequenceGenerator";
import { useSetAtom } from "jotai";
import {
  chordProgressionAtom,
  chordProgressionLoadingAtom,
  isPlayingAtom,
} from "state";
import { useGenerateNewMelody } from "./useGenerateNewMelody";

export function useGenerateNewSong() {
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const generateMelody = useGenerateNewMelody();
  const setChordProgressionLoading = useSetAtom(chordProgressionLoadingAtom);

  return async (mood: Mood | null) => {
    setChordProgressionLoading(true);
    const chordProgression = generateChordProgression({
      rootNote: getRandomNote(),
      mood: mood ?? getRandomMood(),
      notesPerChord: 4,
      octave: 3,
    });
    setChordProgression(chordProgression);
    await generateMelody({ chordProgression, restartPlayback: true });
    setIsPlaying(true);
    setChordProgressionLoading(false);
  };
}
