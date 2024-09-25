import * as mm from "@magenta/music";
import { SequencerEvent } from "./webAudioNodes";

const worker = new Worker("drumPatternGen.worker.js");

const KICK = 36;
const SNARE = 38;
const LOW_TOM = 43;
const MID_TOM = 47;
const HIGH_TOM = 50;
const CRASH_CYMBAL = 49;
const RIDE_CYMBAL = 51;
const CLOSED_HIHAT = 42;
const OPEN_HIHAT = 46;

// Drum pitch classes for reference:
// https://github.com/magenta/magenta/blob/f8cfff4756344f04ed69304cbe02eef4875f27b9/magenta/models/music_vae/data.py#L55C1-L74C2
// ROLAND_DRUM_PITCH_CLASSES = [
//     # kick drum
//     [36],
//     # snare drum
//     [38, 37, 40],
//     # closed hi-hat
//     [42, 22, 44],
//     # open hi-hat
//     [46, 26],
//     # low tom
//     [43, 58],
//     # mid tom
//     [47, 45],
//     # high tom
//     [50, 48],
//     # crash cymbal
//     [49, 52, 55, 57],
//     # ride cymbal
//     [51, 53, 59]
// ]

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
    // {
    //   pitch: CLOSED_HIHAT,
    //   startTime: 1,
    //   endTime: 1.5,
    //   quantizedStartStep: 2,
    //   quantizedEndStep: 3,
    // },
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
  // crash: SequencerEvent[];
  ride: SequencerEvent[];
  lowTom: SequencerEvent[];
  midTom: SequencerEvent[];
  highTom: SequencerEvent[];
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
  const temp =
    (() => {
      switch (intensity) {
        case "low":
          return 0.7;
        case "medium":
          return 0.9;
        case "high":
          return 1.0;
      }
    })() +
    Math.random() * 0.25;

  const promise = new Promise<DrumPattern>((resolve, reject) => {
    worker.onmessage = (e) => {
      const sequence = e.data;
      const drumPattern = {
        kicks: mapToSequencerEvents(sequence.notes, KICK),
        snares: mapToSequencerEvents(sequence.notes, SNARE),
        closedHihats: mapToSequencerEvents(sequence.notes, CLOSED_HIHAT),
        openHihats: mapToSequencerEvents(sequence.notes, OPEN_HIHAT),
        // crash: mapToSequencerEvents(sequence.notes, CRASH_CYMBAL),
        ride: mapToSequencerEvents(sequence.notes, RIDE_CYMBAL),
        lowTom: mapToSequencerEvents(sequence.notes, LOW_TOM),
        midTom: mapToSequencerEvents(sequence.notes, MID_TOM),
        highTom: mapToSequencerEvents(sequence.notes, HIGH_TOM),
      };
      resolve(drumPattern);
    };
    worker.onerror = (e) => {
      reject(e);
    };
  });
  worker.postMessage({ seed, steps: patternLength, temperature: temp });
  return promise;
}
