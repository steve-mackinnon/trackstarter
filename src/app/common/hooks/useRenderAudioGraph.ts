import * as AudioGraph from "audio/audioGraph";
import {
  adsr,
  defaultSequencerProps,
  delay,
  filter,
  masterClipper,
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
  melodySynthParamsAtom,
  SynthParams,
} from "state";

function filterDelay({
  prefix,
  sendAmount,
  time,
  feedback,
}: {
  prefix: string;
  sendAmount: number;
  time: number;
  feedback: number;
}) {
  return filter(
    { type: "lowpass", frequency: 700, q: 10 },
    [
      delay(
        { time, feedback },
        [mul({ multiplier: sendAmount }, [], `${prefix}-delay-input`)],
        `${prefix}-delay`,
      ),
    ],
    [],
    `${prefix}-delay-filter`,
  );
}

export function useRenderAudioGraph() {
  const progressionState = useAtomValue(chordProgressionAtom);
  const harmonySynthParamsState = useAtomValue(harmonySynthParamsAtom);
  const melodySynthParamsState = useAtomValue(melodySynthParamsAtom);
  const melodyState = useAtomValue(melodyAtom);

  return ({
    progression,
    harmonySynthParams,
    melodySynthParams,
    startStep,
    melody,
    restartPlayback = false,
  }: {
    progression?: ChordProgression;
    harmonySynthParams?: SynthParams;
    melodySynthParams?: SynthParams;
    startStep?: number;
    melody?: AudioGraph.SequencerEvent[];
    restartPlayback?: boolean;
  }) => {
    const prog = progression ?? progressionState;
    if (!prog) {
      return;
    }
    const melodySequence = melody ?? melodyState;
    const harmonyParams = harmonySynthParams ?? harmonySynthParamsState;
    const melodyParams = melodySynthParams ?? melodySynthParamsState;

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
        masterClipper([
          adsr(
            {
              attack: harmonyParams.attack,
              decay: harmonyParams.decay,
              sustain: harmonyParams.sustain,
              release: 0.1,
            },
            "harmony-amp-env",
          ),
          adsr(
            {
              attack: melodyParams.attack,
              decay: melodyParams.decay,
              sustain: melodyParams.sustain,
              release: 0.1,
            },
            "melody-amp-env",
          ),
          filterDelay({
            prefix: "melody",
            sendAmount: melodyParams.delayParams.sendAmount,
            time: melodyParams.delayParams.time,
            feedback: melodyParams.delayParams.feedback,
          }),
          filterDelay({
            prefix: "harmony",
            sendAmount: harmonyParams.delayParams.sendAmount,
            time: harmonyParams.delayParams.time,
            feedback: harmonyParams.delayParams.feedback,
          }),
          filter(
            {
              type: "lowpass",
              frequency: harmonyParams.filterFrequency,
              q: harmonyParams.filterQ,
            },
            [
              mul({ multiplier: 0.1 }, [
                osc(
                  {
                    ...harmonyParams,
                    modSources: { gain: ["harmony-amp-env"] },
                  },
                  [],
                  "harmony-osc",
                ),
              ]),
            ],
            ["harmony-delay-input"],
            "harmony-filter",
          ),
          filter(
            {
              type: "lowpass",
              frequency: melodyParams.filterFrequency,
              q: melodyParams.filterQ,
            },
            [
              mul({ multiplier: 0.25 }, [
                osc(
                  {
                    type: melodyParams.type,
                    detune: 0,
                    modSources: { gain: ["melody-amp-env"] },
                  },
                  [],
                  "melody-osc",
                ),
              ]),
            ],
            ["melody-delay-input"],
            "melody-filter",
          ),
        ]),
      ]),
    );
    // Re-trigger playback when a new progression is rendered OR when a new
    // melody is rendered and playback is stopped (to prevent restarting active
    // playback when only the melody changes)
    if (
      restartPlayback ||
      ((progression || melody) && !AudioGraph.isPlaying())
    ) {
      AudioGraph.stop();
      AudioGraph.start(startStep);
    }
  };
}
