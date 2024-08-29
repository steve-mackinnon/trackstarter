import * as mm from "@magenta/music";
import { SequencerEvent } from "./audioGraph";
import { Midi } from "tonal";

const CHECKPOINT_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords";

const mvae = new mm.MusicVAE(CHECKPOINT_URL);
let initialized = false;
export async function generateMelodyForChordProgression(
  chordProgression: string[],
): Promise<SequencerEvent[] | undefined> {
  if (!initialized) {
    await mvae.initialize();
    initialized = true;
  }
  const NUM_SAMPLES = 1;
  const TEMP = 0.5;
  const sequences = await mvae.sample(NUM_SAMPLES, TEMP, { chordProgression });
  const mappedSequence: SequencerEvent[] | undefined = sequences[0].notes?.map(
    (ns) => {
      return {
        note: Midi.midiToNoteName(ns.pitch as number),
        startStep: ns.quantizedStartStep as number,
        endStep: ns.quantizedEndStep as number,
      };
    },
  );
  return mappedSequence;
}
