import { chordsForProgression } from "audio/melodicUtils";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { ChordProgression } from "audio/sequenceGenerator";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useSetAtom } from "jotai";
import { ParamState } from "paramsSchema";
import {
  chordProgressionAtom,
  harmonySynthParamsAtom,
  melodyAtom,
  melodySynthParamsAtom,
} from "state";

export function useApplyStateFromChatResponse() {
  const setHarmonySynthParams = useSetAtom(harmonySynthParamsAtom);
  const setMelodySynthParams = useSetAtom(melodySynthParamsAtom);
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setMelody = useSetAtom(melodyAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return async (state: ParamState) => {
    const { chordNotes, chordNames } = chordsForProgression({
      progression: state.chordProgression,
      scaleName: state.scale,
      octave: 3,
      rootNote: state.rootNote,
      notesPerChord: 4,
    });
    const chordProgression: ChordProgression = {
      chordNotes,
      chordNames,
      progression: state.chordProgression,
      scale: state.scale,
      mood: "Uplifting",
      rootNote: state.rootNote,
      octave: 3,
    };
    const melody = await generateMelodyForChordProgression(
      chordNames,
      state.scale,
      state.rootNote,
    );
    if (!melody) {
      throw new Error(
        `Failed to generate melody to accompany chord progression ${chordNames}`,
      );
    }
    setMelody(melody);
    setChordProgression(chordProgression);
    setHarmonySynthParams(state.harmonySynthState);
    setMelodySynthParams(state.melodySynthState);
    renderAudioGraph({
      progression: chordProgression,
      harmonySynthParams: state.harmonySynthState,
      melodySynthParams: state.melodySynthState,
      melody,
    });
  };
}
