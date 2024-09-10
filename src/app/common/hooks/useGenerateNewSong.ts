import { Mood } from "audio/melodicConstants";
import {
  generateChordProgression,
  getRandomMood,
  getRandomNote,
} from "audio/sequenceGenerator";
import { useSetAtom } from "jotai";
import { chordProgressionAtom, isPlayingAtom } from "state";
import { useGenerateNewMelody } from "./useGenerateNewMelody";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewSong() {
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const generateMelody = useGenerateNewMelody();

  return (mood: Mood | null) => {
    const chordProgression = generateChordProgression({
      rootNote: getRandomNote(),
      mood: mood ?? getRandomMood(),
      notesPerChord: 4,
      octave: 3,
    });
    setChordProgression(chordProgression);
    renderAudioGraph({
      progression: chordProgression,
      restartPlayback: true,
    });
    setIsPlaying(true);

    generateMelody({ chordProgression, restartPlayback: false });
  };
}
