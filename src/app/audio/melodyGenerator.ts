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
  try {
    if (!initialized) {
      await mvae.initialize();
      initialized = true;
    }
    // MusicVAE can't handle slash chords, so just omit the slash and rely on snapping
    // to scale to keep the melody in key.
    chordProgression = chordProgression.map((chord) => chord.split("/")[0]);
    const NUM_SAMPLES = 5;
    const TEMP = 0.5;
    const sequences = await mvae.sample(NUM_SAMPLES, TEMP, {
      chordProgression,
    });
    const scale = Scale.get(`${rootNote} ${scaleName}`).notes;
    // Choose the melodity with the largest variety of notes
    const sequence = sequences.sort((a, b) => {
      const aUniqueNotes = new Set(a.notes!.map((n) => n.pitch!)).size;
      const bUniqueNotes = new Set(b.notes!.map((n) => n.pitch!)).size;
      if (aUniqueNotes < bUniqueNotes) {
        return -1;
      } else if (aUniqueNotes === bUniqueNotes) {
        return 0;
      }
      return 1;
    })[0];
    const mappedSequence: SequencerEvent[] | undefined = sequence.notes?.map(
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
  } catch (e) {
    console.error(e);
  }
}
