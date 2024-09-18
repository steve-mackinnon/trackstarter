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
  octave: number,
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
    const scale = Scale.get(`${rootNote}${octave} ${scaleName}`).notes;
    // Choose the melodity with the largest variety of notes
    const sequence = sequences.sort((a, b) => {
      const aUniqueNotes = new Set(a.notes!.map((n) => n.pitch!)).size;
      const bUniqueNotes = new Set(b.notes!.map((n) => n.pitch!)).size;
      // Descending sort
      return bUniqueNotes - aUniqueNotes;
    })[0];
    const mappedSequence: SequencerEvent[] | undefined = sequence.notes?.map(
      (note) => ({
        note: snapNoteToScale(note.pitch!, scale),
        startStep: (note.quantizedStartStep as number) * 2,
        endStep: (note.quantizedEndStep as number) * 2,
      }),
    );
    return mappedSequence;
  } catch (e) {
    console.error(e);
  }
}

function snapNoteToScale(midiNote: number, scale: string[]): string {
  const note = Midi.midiToNoteName(midiNote);
  // Map/reduce over the scale to find the closest note
  return scale
    .map((scaleNote) => ({
      note: scaleNote,
      distance: Math.abs(Interval.semitones(Note.distance(scaleNote, note))),
    }))
    .reduce((prev, current) =>
      current.distance < prev.distance ? current : prev,
    ).note;
}
