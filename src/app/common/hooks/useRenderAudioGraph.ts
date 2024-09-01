import * as AudioGraph from "audio/audioGraph";
import {
  adsr,
  defaultSequencerProps,
  filter,
  mul,
  osc,
  output,
  sequencer,
} from "audio/nodes";
import {
  ChordProgression,
  chordProgressionToSequencerEvents,
} from "audio/sequenceGenerator";
import { useAtomValue } from "jotai";
import {
  chordProgressionAtom,
  harmonySynthParamsAtom,
  SynthParams,
} from "state";

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
    harmonySynthParams?: SynthParams;
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
        destinationNodes: ["harmony-osc", "harmony-amp-env"],
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
        adsr(
          {
            attack: 0.3,
            decay: 0.9,
            sustain: 0.3,
            release: 0.1,
          },
          "harmony-amp-env",
        ),
        filter(
          {
            type: "lowpass",
            frequency: params.filterFrequency,
            q: 2,
          },
          [
            mul({ multiplier: 0.1 }, [
              osc(
                { ...params, modSources: { gain: ["harmony-amp-env"] } },
                [],
                "harmony-osc",
              ),
            ]),
          ],
          "chord-prog-filter",
        ),
        mul({ multiplier: 0.25 }, [
          osc({ type: "sine", detune: 0 }, [], "melody-osc"),
        ]),
      ]),
    );
    AudioGraph.stop();
    AudioGraph.start(startStep);
  };
}
