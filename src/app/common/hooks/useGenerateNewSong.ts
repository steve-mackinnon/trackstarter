import { generateDrumPattern } from "audio/drumPatternGenerator";
import { Mood } from "audio/melodicConstants";
import {
  generateChordProgression,
  getRandomMood,
  getRandomNote,
} from "audio/sequenceGenerator";
import { SequencerEvent } from "audio/webAudioNodes";
import { useSetAtom } from "jotai";
import {
  chordProgressionAtom,
  chordProgressionLoadingAtom,
  drumsAtom,
  drumsLoadingAtom,
  DrumsParams,
  isPlayingAtom,
} from "state";
import { useGenerateNewMelody } from "./useGenerateNewMelody";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewSong() {
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const generateMelody = useGenerateNewMelody();
  const setChordProgressionLoading = useSetAtom(chordProgressionLoadingAtom);
  const setDrumsLoading = useSetAtom(drumsLoadingAtom);
  const setDrums = useSetAtom(drumsAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return async (mood: Mood | null, generateDrums: boolean) => {
    setChordProgressionLoading(true);
    const chordProgression = generateChordProgression({
      rootNote: getRandomNote(),
      mood: mood ?? getRandomMood(),
      notesPerChord: 4,
      octave: 3,
    });

    setChordProgression(chordProgression);

    let drums: DrumsParams | undefined;
    const runDrumGeneration = async () => {
      if (!generateDrums) {
        return;
      }
      setDrumsLoading(true);
      const { kicks, snares, closedHihats, openHihats } =
        await generateDrumPattern();
      drums = {
        muted: false,
        kickPattern: kicks,
        snarePattern: snares,
        closedHHPattern: closedHihats,
        openHHPattern: openHihats,
      };
      setDrums(drums);
    };

    let melody: SequencerEvent[] | undefined;
    const runMelodyGeneration = async () => {
      melody = await generateMelody({
        chordProgression,
      });
    };

    await Promise.all([runDrumGeneration(), runMelodyGeneration()]);
    renderAudioGraph({
      melody,
      progression: chordProgression,
      drums,
      restartPlayback: generateDrums,
    });
    setIsPlaying(true);
    setDrumsLoading(false);
    setChordProgressionLoading(false);
  };
}
