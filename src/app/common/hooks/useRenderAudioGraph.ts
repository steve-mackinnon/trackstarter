import {
  adsr as adsrNode,
  clipper,
  delay,
  filter,
  lfo,
  mul,
  osc,
  output,
  sequencer,
} from "audio/nodes";
import {
  ChordProgression,
  chordProgressionToSequencerEvents,
} from "audio/sequenceGenerator";
import { SequencerEvent } from "audio/webAudioNodes";
import { audioGraph } from "common/audio";
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
    { type: "lowpass", frequency: 700, q: 10, key: `${prefix}-delay-filter` },
    [
      delay({ time, feedback, key: `${prefix}-delay` }, [
        mul({ multiplier: sendAmount, key: `${prefix}-delay-input` }, []),
      ]),
    ],
  );
}

function synthVoice({
  params,
  prefix,
}: {
  params: SynthParams;
  prefix: string;
}) {
  return filter(
    {
      type: "lowpass",
      frequency: params.filterFrequency,
      q: params.filterQ,
      auxOutputs: [`${prefix}-delay-input`],
      key: `${prefix}-filter`,
      modSources: {
        frequency: [
          { key: `${prefix}-filter-lfo`, amount: params.filterLFO.amount },
        ],
      },
    },
    [
      mul({ multiplier: params.gain, key: `${prefix}-gain` }, [
        osc({
          ...params,
          modSources: {
            gain: [{ key: `${prefix}-amp-env`, amount: 1 }],
            frequency: [
              {
                key: `${prefix}-osc-frequency-lfo`,
                amount: params.oscFrequencyLFO.amount,
              },
            ],
          },
          key: `${prefix}-osc`,
        }),
      ]),
    ],
  );
}
function adsr(params: SynthParams, key: string) {
  return adsrNode({
    attack: params.attack,
    decay: params.decay,
    sustain: params.sustain,
    release: 0.1,
    key,
  });
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
    melody?: SequencerEvent[];
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
        destinationNodes: ["harmony-osc"],
        notes: sequence,
        length: 64,
        key: "harmony-seq",
      }),
    ];
    if (melodySequence) {
      sequencers.push(
        sequencer({
          destinationNodes: ["melody-osc"],
          notes: melodySequence,
          length: 64,
          key: "melody-seq",
        }),
      );
    }
    audioGraph.render(
      output([
        ...sequencers,
        lfo({
          key: "harmony-osc-frequency-lfo",
          frequency: harmonyParams.oscFrequencyLFO.rate,
          type: "sine",
        }),
        lfo({
          key: "melody-osc-frequency-lfo",
          frequency: melodyParams.oscFrequencyLFO.rate,
          type: "sine",
        }),
        lfo({
          key: "harmony-filter-lfo",
          frequency: harmonyParams.filterLFO.rate,
          type: "sine",
        }),
        lfo({
          key: "melody-filter-lfo",
          frequency: melodyParams.filterLFO.rate,
          type: "sine",
        }),
        adsr(harmonyParams, "harmony-amp-env"),
        adsr(melodyParams, "melody-amp-env"),
        clipper({}, [
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
          synthVoice({
            params: harmonyParams,
            prefix: "harmony",
          }),
          synthVoice({ params: melodyParams, prefix: "melody" }),
        ]),
      ]),
    );
    // Re-trigger playback when a new progression is rendered OR when a new
    // melody is rendered and playback is stopped (to prevent restarting active
    // playback when only the melody changes)
    if (
      restartPlayback ||
      ((progression || melody) && !audioGraph.isPlaying())
    ) {
      audioGraph.stop();
      audioGraph.start(startStep);
    }
  };
}
