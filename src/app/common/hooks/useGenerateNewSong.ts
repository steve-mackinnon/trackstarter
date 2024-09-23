import { generateDrumPattern } from "audio/drumPatternGenerator";
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
  closedHHPatternAtom,
  isPlayingAtom,
  kickPatternAtom,
  snarePatternAtom,
} from "state";
import { useGenerateNewMelody } from "./useGenerateNewMelody";

export function useGenerateNewSong() {
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const generateMelody = useGenerateNewMelody();
  const setChordProgressionLoading = useSetAtom(chordProgressionLoadingAtom);
  const setKickPattern = useSetAtom(kickPatternAtom);
  const setSnarePattern = useSetAtom(snarePatternAtom);
  const setClosedHHPattern = useSetAtom(closedHHPatternAtom);

  return async (mood: Mood | null) => {
    setChordProgressionLoading(true);
    const chordProgression = generateChordProgression({
      rootNote: getRandomNote(),
      mood: mood ?? getRandomMood(),
      notesPerChord: 4,
      octave: 3,
    });
    setChordProgression(chordProgression);
    const drumPattern = await generateDrumPattern();
    setKickPattern(drumPattern.kicks);
    setSnarePattern(drumPattern.snares);
    setClosedHHPattern(drumPattern.hihats);

    await generateMelody({
      chordProgression,
      restartPlayback: false,
      kickPattern: drumPattern.kicks,
      snarePattern: drumPattern.snares,
      closedHHPattern: drumPattern.hihats,
    });
    setIsPlaying(true);
    setChordProgressionLoading(false);
  };
}
