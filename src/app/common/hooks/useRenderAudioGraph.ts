import * as AudioGraph from "audio/audioGraph";
import { defaultSequencerProps, osc, output, sequencer } from "audio/nodes";
import {
  ChordProgression,
  chordProgressionToSequencerEvents,
} from "audio/sequenceGenerator";
import { useAtomValue } from "jotai";
import { chordProgressionAtom, harmonySynthParamsAtom } from "state";

export function useRenderAudioGraph() {
  const progressionState = useAtomValue(chordProgressionAtom);
  const harmonySynthParamsState = useAtomValue(harmonySynthParamsAtom);

  return ({
    progression,
    harmonySynthParams,
    startStep,
  }: {
    progression?: ChordProgression;
    harmonySynthParams?: AudioGraph.OscProps;
    startStep?: number;
  }) => {
    const prog = progression ?? progressionState;
    if (!prog) {
      return;
    }
    const params = harmonySynthParams ?? harmonySynthParamsState;

    const sequence = chordProgressionToSequencerEvents(prog.chordNotes);
    AudioGraph.render(
      output(undefined, [
        sequencer({
          ...defaultSequencerProps(),
          destinationNodes: ["0"],
          notes: sequence,
          length: 64,
        }),
        osc(params, [], "0"),
      ])
    );
    AudioGraph.stop();
    AudioGraph.start(startStep);
  };
}
