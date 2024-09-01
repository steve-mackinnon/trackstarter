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
  melodyAtom,
  SynthParams,
} from "state";

export function useRenderAudioGraph() {
  const progressionState = useAtomValue(chordProgressionAtom);
  const harmonySynthParamsState = useAtomValue(harmonySynthParamsAtom);
  const melodyState = useAtomValue(melodyAtom);

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
    const melodySequence = melody ?? melodyState;
    const params = harmonySynthParams ?? harmonySynthParamsState;

    const sequence = chordProgressionToSequencerEvents(prog.chordNotes);
    const sequencers = [
      sequencer({
        ...defaultSequencerProps(),
        destinationNodes: ["harmony-osc"],
        notes: sequence,
        length: 64,
      }),
    ];
    if (melodySequence) {
      sequencers.push(
        sequencer({
          ...defaultSequencerProps(),
          destinationNodes: ["melody-osc"],
          notes: melodySequence,
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
        adsr(
          {
            attack: 0.1,
            decay: 0.3,
            sustain: 0.1,
            release: 0.1,
          },
          "melody-amp-env",
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
          osc(
            {
              type: "sine",
              detune: 0,
              modSources: { gain: ["melody-amp-env"] },
            },
            [],
            "melody-osc",
          ),
        ]),
      ]),
    );
    AudioGraph.stop();
    AudioGraph.start(startStep);
  };
}
