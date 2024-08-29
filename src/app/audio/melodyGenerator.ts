import * as mm from "@magenta/music";
import { Midi } from "tonal";
import { SequencerEvent } from "./audioGraph";

const CHECKPOINT_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords";
// "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/multitrack_chords";

const mvae = new mm.MusicVAE(CHECKPOINT_URL);
let initialized = false;

export async function generateMelodyForChordProgression(
  chordProgression: string[],
  numBars: number,
): Promise<SequencerEvent[] | undefined> {
  if (!initialized) {
    await mvae.initialize();
    initialized = true;
  }
  const NUM_RESULTS = 1;
  const TEMP = 0.5;
  const BARS_PER_SAMPLE = 2;
  const chordsPerSample = (chordProgression.length / numBars) * BARS_PER_SAMPLE;

  const sequencePromises: Promise<mm.INoteSequence[]>[] = [];
  for (let i = 0; i < chordProgression.length / chordsPerSample; ++i) {
    sequencePromises.push(
      mvae.sample(NUM_RESULTS, TEMP, {
        chordProgression: [chordProgression[i], chordProgression[i + 1]],
      }),
    );
  }
  const sequences = await Promise.all(sequencePromises);
  let events: SequencerEvent[] = [];
  sequences.forEach((seq, i) => {
    const mappedSeq: SequencerEvent[] = seq[0].notes!.map((ns) => {
      return {
        note: Midi.midiToNoteName(ns.pitch as number),
        startStep: (ns.quantizedStartStep as number) + i * 32,
        endStep: (ns.quantizedEndStep as number) + i * 32,
      };
    });
    events = events.concat(mappedSeq);
  });
  return events;
}
