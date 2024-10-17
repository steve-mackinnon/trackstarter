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
    console.log(`state from LLM: ${JSON.stringify(state)}`);
    // const { chordNotes, chordNames } = chordsForProgression({
    //   progression: state.chordProgression,
    //   scaleName: state.scale,
    //   rootNote: state.rootNote,
    //   notesPerChord: 4,
    //   octave: 3,
    // });
    // const chordProgression: ChordProgression = {
    //   chordNotes,
    //   chordNames,
    //   progression: state.chordProgression,
    //   scale: state.scale,
    //   mood: "Uplifting",
    //   rootNote: state.rootNote,
    //   octave: 3,
    // };
    setMelody(state.melody);
    // setChordProgression(chordProgression);
    setHarmonySynthParams(state.harmonySynthState);
    setMelodySynthParams(state.melodySynthState);
    renderAudioGraph({
      progressionSequence: state.chordProgression,
      harmonySynthParams: state.harmonySynthState,
      melodySynthParams: state.melodySynthState,
      melody: state.melody,
    });
  };
}
