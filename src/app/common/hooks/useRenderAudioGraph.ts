import * as AudioGraph from "audio/audioGraph";
import {
  defaultSequencerProps,
  filter,
  osc,
  output,
  sequencer,
} from "audio/nodes";
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
    melody,
  }: {
    progression?: ChordProgression;
    harmonySynthParams?: AudioGraph.OscProps;
    startStep?: number;
    melody?: AudioGraph.SequencerEvent[];
  }) => {
    const prog = progression ?? progressionState;
    if (!prog) {
      return;
    }
    const params = harmonySynthParams ?? harmonySynthParamsState;

    const sequence = chordProgressionToSequencerEvents(prog.chordNotes);
    const sequencers = [
      sequencer({
        ...defaultSequencerProps(),
        destinationNodes: ["0"],
        notes: sequence,
        length: 64,
      }),
    ];
    if (melody) {
      sequencers.push(
        sequencer({
          ...defaultSequencerProps(),
          destinationNodes: ["melody-osc"],
          notes: melody,
          length: 64,
        }),
      );
    }
    AudioGraph.render(
      output(undefined, [
        ...sequencers,
        filter(
          { type: "lowpass", frequency: 700, q: 2 },
          [
            osc(params, [], "0"),
            osc({ type: "square", detune: 0 }, [], "melody-osc"),
          ],
          "chord-prog-filter",
        ),
      ]),
    );
    AudioGraph.stop();
    AudioGraph.start(startStep);
  };
}
