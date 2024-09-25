import * as mm from "@magenta/music";
import { SequencerEvent } from "./webAudioNodes";

const DRUMS_CHECKPOINT_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn";

const drumsRnn = new mm.MusicRNN(DRUMS_CHECKPOINT_URL);
const initPromise = drumsRnn.initialize();

const KICK = 36;
const SNARE = 38;
const CLOSED_HIHAT = 42;
const OPEN_HIHAT = 46;

// For reference, here's a snippet from the Neural Drum Machine demo
// https://codepen.io/teropa/pen/JLjXGK
// let drumKit = [
//   new Tone.Players({
//     high: `${sampleBaseUrl}/808-kick-vh.mp3`,
//     med: `${sampleBaseUrl}/808-kick-vm.mp3`,
//     low: `${sampleBaseUrl}/808-kick-vl.mp3`
//   }).toMaster(),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/flares-snare-vh.mp3`,
//     med: `${sampleBaseUrl}/flares-snare-vm.mp3`,
//     low: `${sampleBaseUrl}/flares-snare-vl.mp3`
//   }).connect(snarePanner),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/808-hihat-vh.mp3`,
//     med: `${sampleBaseUrl}/808-hihat-vm.mp3`,
//     low: `${sampleBaseUrl}/808-hihat-vl.mp3`
//   }).connect(new Tone.Panner(-0.5).connect(reverb)),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/808-hihat-open-vh.mp3`,
//     med: `${sampleBaseUrl}/808-hihat-open-vm.mp3`,
//     low: `${sampleBaseUrl}/808-hihat-open-vl.mp3`
//   }).connect(new Tone.Panner(-0.5).connect(reverb)),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/slamdam-tom-low-vh.mp3`,
//     med: `${sampleBaseUrl}/slamdam-tom-low-vm.mp3`,
//     low: `${sampleBaseUrl}/slamdam-tom-low-vl.mp3`
//   }).connect(new Tone.Panner(-0.4).connect(reverb)),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/slamdam-tom-mid-vh.mp3`,
//     med: `${sampleBaseUrl}/slamdam-tom-mid-vm.mp3`,
//     low: `${sampleBaseUrl}/slamdam-tom-mid-vl.mp3`
//   }).connect(reverb),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/slamdam-tom-high-vh.mp3`,
//     med: `${sampleBaseUrl}/slamdam-tom-high-vm.mp3`,
//     low: `${sampleBaseUrl}/slamdam-tom-high-vl.mp3`
//   }).connect(new Tone.Panner(0.4).connect(reverb)),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/909-clap-vh.mp3`,
//     med: `${sampleBaseUrl}/909-clap-vm.mp3`,
//     low: `${sampleBaseUrl}/909-clap-vl.mp3`
//   }).connect(new Tone.Panner(0.5).connect(reverb)),
//   new Tone.Players({
//     high: `${sampleBaseUrl}/909-rim-vh.wav`,
//     med: `${sampleBaseUrl}/909-rim-vm.wav`,
//     low: `${sampleBaseUrl}/909-rim-vl.wav`
//   }).connect(new Tone.Panner(0.5).connect(reverb))
// ];
//let midiDrums = [36, 38, 42, 46, 41, 43, 45, 49, 51];

const seed: mm.INoteSequence = {
  ticksPerQuarter: 220,
  timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
  tempos: [{ time: 0, qpm: 160 }],
  notes: [
    {
      pitch: KICK,
      startTime: 0,
      endTime: 0.5,
      quantizedStartStep: 0,
      quantizedEndStep: 1,
    },
    {
      pitch: CLOSED_HIHAT,
      startTime: 1,
      endTime: 1.5,
      quantizedStartStep: 2,
      quantizedEndStep: 3,
    },
  ],
  totalTime: 8,
  quantizationInfo: { stepsPerQuarter: 1 },
  totalQuantizedSteps: 16,
};

export interface DrumPattern {
  kicks: SequencerEvent[];
  snares: SequencerEvent[];
  closedHihats: SequencerEvent[];
  openHihats: SequencerEvent[];
}

function mapToSequencerEvents(
  notes: mm.NoteSequence.INote[],
  note: number,
): SequencerEvent[] {
  return notes
    .filter((n) => n.pitch === note)
    .map((n) => ({
      note: "C3",
      startStep: n.quantizedStartStep as number,
      endStep: n.quantizedEndStep as number,
    }));
}

export async function generateDrumPattern(
  intensity: "low" | "medium" | "high",
  patternLength: number,
): Promise<DrumPattern> {
  await initPromise;
  const temp = (() => {
    switch (intensity) {
      case "low":
        return 0.9;
      case "medium":
        return 1.0;
      case "high":
        return 1.15;
    }
  })();
  const sequence = await drumsRnn.continueSequence(seed, patternLength, temp);
  return {
    kicks: mapToSequencerEvents(sequence.notes!, KICK),
    snares: mapToSequencerEvents(sequence.notes!, SNARE),
    closedHihats: mapToSequencerEvents(sequence.notes!, CLOSED_HIHAT),
    openHihats: mapToSequencerEvents(sequence.notes!, OPEN_HIHAT),
  };
}
