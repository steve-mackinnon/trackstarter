import {
  adsr as adsrNode,
  clipper,
  delay,
  filter,
  lfo,
  mul,
  osc,
  output,
  sample,
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
  closedHHPatternAtom,
  harmonySynthParamsAtom,
  kickPatternAtom,
  melodyAtom,
  melodySynthParamsAtom,
  openHHPatternAtom,
  snarePatternAtom,
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
    release: params.release,
    key,
  });
}

export function useRenderAudioGraph() {
  const progressionState = useAtomValue(chordProgressionAtom);
  const harmonySynthParamsState = useAtomValue(harmonySynthParamsAtom);
  const melodySynthParamsState = useAtomValue(melodySynthParamsAtom);
  const melodyState = useAtomValue(melodyAtom);
  const kickPatternState = useAtomValue(kickPatternAtom);
  const snarePatternState = useAtomValue(snarePatternAtom);
  const closedHHPatternState = useAtomValue(closedHHPatternAtom);
  const openHHPatternState = useAtomValue(openHHPatternAtom);

  return ({
    progression,
    harmonySynthParams,
    melodySynthParams,
    startStep,
    melody,
    kickPattern,
    snarePattern,
    closedHHPattern,
    openHHPattern,
    restartPlayback = false,
  }: {
    progression?: ChordProgression;
    harmonySynthParams?: SynthParams;
    melodySynthParams?: SynthParams;
    startStep?: number;
    melody?: SequencerEvent[];
    restartPlayback?: boolean;
    kickPattern?: SequencerEvent[];
    snarePattern?: SequencerEvent[];
    closedHHPattern?: SequencerEvent[];
    openHHPattern?: SequencerEvent[];
  }) => {
    const prog = progression ?? progressionState;
    if (!prog) {
      return;
    }
    const melodySequence = melody ?? melodyState;
    const harmonyParams = harmonySynthParams ?? harmonySynthParamsState;
    const melodyParams = melodySynthParams ?? melodySynthParamsState;
    kickPattern = kickPattern ?? kickPatternState ?? [];
    snarePattern = snarePattern ?? snarePatternState ?? [];
    closedHHPattern = closedHHPattern ?? closedHHPatternState ?? [];
    openHHPattern = openHHPattern ?? openHHPatternState ?? [];

    const sequence = chordProgressionToSequencerEvents(prog.chordNotes);
    const sequencers = [
      sequencer({
        destinationNodes: ["harmony-osc"],
        notes: sequence,
        length: 64,
        key: "harmony-seq",
      }),
      sequencer({
        destinationNodes: ["open-hh-osc"],
        notes: openHHPattern,
        length: 64,
        key: "open-hh-seq",
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
        sequencer({
          destinationNodes: ["kick"],
          notes: kickPattern,
          length: 128,
          key: "kick-seq",
        }),
        sequencer({
          destinationNodes: ["snare"],
          notes: snarePatternState ?? [],
          length: 128,
          key: "snare-seq",
        }),
        sequencer({
          destinationNodes: ["closed-hh"],
          notes: closedHHPatternState ?? [],
          length: 128,
          key: "closed-hh-seq",
        }),
        sequencer({
          destinationNodes: ["open-hh"],
          notes: openHHPattern,
          length: 128,
          key: "open-hh-seq",
        }),
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
        sample({ key: "kick", sampleId: "kick", lengthMs: 700 }),
        sample({ key: "snare", sampleId: "snare", lengthMs: 700 }),
        sample({ key: "closed-hh", sampleId: "closed-hh", lengthMs: 700 }),
        sample({ key: "open-hh", sampleId: "open-hh", lengthMs: 700 }),
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
