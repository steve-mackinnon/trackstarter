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
  closedHHPatternAtom,
  isPlayingAtom,
  kickPatternAtom,
  openHHPatternAtom,
  snarePatternAtom,
} from "state";
import { useGenerateNewMelody } from "./useGenerateNewMelody";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewSong() {
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const generateMelody = useGenerateNewMelody();
  const setChordProgressionLoading = useSetAtom(chordProgressionLoadingAtom);
  const setKickPattern = useSetAtom(kickPatternAtom);
  const setSnarePattern = useSetAtom(snarePatternAtom);
  const setClosedHHPattern = useSetAtom(closedHHPatternAtom);
  const setOpenHHPattern = useSetAtom(openHHPatternAtom);
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

    let kicks: SequencerEvent[] | undefined;
    let snares: SequencerEvent[] | undefined;
    let hihats: SequencerEvent[] | undefined;
    let openHihats: SequencerEvent[] | undefined;
    const runDrumGeneration = async () => {
      if (!generateDrums) {
        return;
      }
      ({ kicks, snares, hihats, openHihats } = await generateDrumPattern());
      setKickPattern(kicks);
      setSnarePattern(snares);
      setClosedHHPattern(hihats);
      setOpenHHPattern(openHihats);
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
      kickPattern: kicks,
      snarePattern: snares,
      closedHHPattern: hihats,
      openHHPattern: openHihats,
      restartPlayback: generateDrums,
    });
    setIsPlaying(true);
    setChordProgressionLoading(false);
  };
}
