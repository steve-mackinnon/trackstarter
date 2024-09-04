import * as mm from "@magenta/music";
import { Interval, Midi, Note, Scale } from "tonal";
import { SequencerEvent } from "./audioGraph";

const CHECKPOINT_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_chords";

const mvae = new mm.MusicVAE(CHECKPOINT_URL);
let initialized = false;
export async function generateMelodyForChordProgression(
  chordProgression: string[],
  scaleName: string,
  rootNote: string,
): Promise<SequencerEvent[] | undefined> {
  if (!initialized) {
    await mvae.initialize();
    initialized = true;
  }
  // MusicVAE can't handle slash chords, so just omit them
  chordProgression = chordProgression.map((chord) => chord.split("/")[0]);
  const NUM_SAMPLES = 1;
  const TEMP = 0.5;
  const sequences = await mvae.sample(NUM_SAMPLES, TEMP, { chordProgression });
  const scale = Scale.get(`${rootNote} ${scaleName}`).notes;
  const mappedSequence: SequencerEvent[] | undefined = sequences[0].notes?.map(
    (ns) => {
      const note = Midi.midiToNoteName(ns.pitch as number);
      const octave = note[note.length - 1];
      const noteSnappedToScale = scale
        .map((scaleNote) => ({
          note: scaleNote + octave,
          distance: Math.abs(
            Interval.semitones(Note.distance(scaleNote, note)),
          ),
        }))
        .reduce((prev, current) =>
          current.distance < prev.distance ? current : prev,
        ).note;
      return {
        note: noteSnappedToScale,
        startStep: (ns.quantizedStartStep as number) * 2,
        endStep: (ns.quantizedEndStep as number) * 2,
      };
    },
  );
  return mappedSequence;
}
