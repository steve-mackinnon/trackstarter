import { AudioGraph } from "audio/graph";
import {
  adsr as adsrNode,
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
import { WebAudioDelegate } from "audio/webAudioDelegate";
import { SequencerEvent } from "audio/webAudioNodes";
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
    },
    [
      mul(
        { multiplier: params.gain },
        [
          osc(
            {
              ...params,
              modSources: { gain: [`${prefix}-amp-env`] },
            },
            [],
            `${prefix}-osc`,
          ),
        ],
        `${prefix}-gain`,
      ),
    ],
    [`${prefix}-delay-input`],
    `${prefix}-filter`,
  );
}

function adsr(params: SynthParams, key: string) {
  return adsrNode(
    {
      attack: params.attack,
      decay: params.decay,
      sustain: params.sustain,
      release: 0.1,
    },
    key,
  );
}

const graph = new AudioGraph(new WebAudioDelegate());

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
      sequencer(
        {
          ...defaultSequencerProps(),
          destinationNodes: ["harmony-osc"],
          notes: sequence,
          length: 64,
        },
        "harmony-seq",
      ),
    ];
    if (melodySequence) {
      sequencers.push(
        sequencer(
          {
            ...defaultSequencerProps(),
            destinationNodes: ["melody-osc"],
            notes: melodySequence,
            length: 64,
          },
          "melody-seq",
        ),
      );
    }
    graph.render(
      output(undefined, [
        ...sequencers,
        masterClipper([
          adsr(harmonyParams, "harmony-amp-env"),
          adsr(melodyParams, "melody-amp-env"),
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
          synthVoice({ params: harmonyParams, prefix: "harmony" }),
          synthVoice({ params: melodyParams, prefix: "melody" }),
        ]),
      ]),
    );
    // Re-trigger playback when a new progression is rendered OR when a new
    // melody is rendered and playback is stopped (to prevent restarting active
    // playback when only the melody changes)
    if (restartPlayback || ((progression || melody) && !graph.isPlaying())) {
      graph.stop();
      graph.start(startStep);
    }
  };
}
