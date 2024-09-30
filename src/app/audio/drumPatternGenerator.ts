import * as mm from "@magenta/music";
import { SequencerEvent } from "./webAudioNodes";

const workers = [
  new Worker("drumPatternGen.worker.js"),
  // new Worker("drumPatternGen.worker.js"),
  // new Worker("drumPatternGen.worker.js"),
  // new Worker("drumPatternGen.worker.js"),
];

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
      isDrum: true,
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
    Math.random() * 0.15;

  const promise = new Promise<DrumPattern>((resolve, reject) => {
    let sequences: mm.INoteSequence[] = [];
    workers.forEach((worker) => {
      worker.onmessage = (e) => {
        const sequence = e.data as mm.INoteSequence;
        sequences.push(sequence);
        if (sequences.length === workers.length) {
          // Randomly choose the longest sequence 60% of the time,
          // and the second longest sequence 40% of the time
          let index = Math.random() > 0.4 ? 0 : sequences.length > 1 ? 1 : 0;
          const sortedSequences = sequences.sort(
            (a, b) => b.notes!.length - a.notes!.length,
          );
          // Attempt to filter out "over the top" patterns
          while (
            sortedSequences[index].notes!.length >= patternLength * 0.8 &&
            index > 0
          ) {
            index--;
          }
          const longestSequence = sortedSequences[index];
          const drumPattern: DrumPattern = {
            kicks: mapToSequencerEvents(longestSequence.notes ?? [], KICK),
            snares: mapToSequencerEvents(longestSequence.notes ?? [], SNARE),
            closedHihats: mapToSequencerEvents(
              longestSequence.notes ?? [],
              CLOSED_HIHAT,
            ),
            openHihats: mapToSequencerEvents(
              longestSequence.notes ?? [],
              OPEN_HIHAT,
            ),
            ride: mapToSequencerEvents(
              longestSequence.notes ?? [],
              RIDE_CYMBAL,
            ),
            lowTom: mapToSequencerEvents(longestSequence.notes ?? [], LOW_TOM),
            midTom: mapToSequencerEvents(longestSequence.notes ?? [], MID_TOM),
            highTom: mapToSequencerEvents(
              longestSequence.notes ?? [],
              HIGH_TOM,
            ),
          };
          resolve(drumPattern);
        }
      };
    });
    workers.forEach(
      (worker) =>
        (worker.onerror = (e) => {
          reject(e);
        }),
    );
  });
  workers.forEach((worker) =>
    worker.postMessage({ seed, steps: patternLength, temperature: temp }),
  );
  return promise;
}
