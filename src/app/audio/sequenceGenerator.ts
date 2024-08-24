import { NoteWithOctave, Scale } from "tonal";
import { Note, SequencerEvent } from "./audioGraph";

export type Mood =
  | "Uplifting"
  | "Dark"
  | "Exotic"
  | "Mysterious"
  | "Dramatic"
  | "Sophisticated"
  | "Dreamy"
  | "Groovy"
  | "Surreal";

const MOOD_TO_SCALE: Record<Mood, string> = {
  Dark: "aeolian",
  Dramatic: "harmonic minor",
  Dreamy: "lydian",
  Exotic: "phrygian",
  Groovy: "mixolydian",
  Mysterious: "whole tone",
  Sophisticated: "melodic minor",
  Surreal: "augmented",
  Uplifting: "ionian",
};

export function generateSequence(
  mood: Mood,
  length: number,
  root: Note,
  octave: number
): NoteWithOctave[] {
  const scale = MOOD_TO_SCALE[mood];
  const notes = Scale.get(`${root}${octave} ${scale}`).notes;
  return Array.from({ length }).map(
    () =>
      notes[
        Math.floor(Math.random() * (notes.length - 1)) % (notes.length - 1)
      ] as Note
  );
}

export function generateChordProgression(mood: Mood): string[][] {
  const notes = Scale.get(`C4 ${MOOD_TO_SCALE[mood]}`).notes;
  const chordDegrees = [0, 3, 0, 4];
  return chordDegrees.map((degree) => chordForScale(notes, degree, 4));
}

export function chordProgressionToSequencerEvents(
  progression: string[][]
): SequencerEvent[] {
  const events: SequencerEvent[] = [];
  progression.forEach((chord, chordIndex) => {
    chord.forEach((note) => {
      events.push({
        note,
        startStep: chordIndex * 32,
        endStep: chordIndex * 32 + 32,
      });
    });
  });
  return events;
}

function chordForScale(
  scaleNotes: string[],
  rootDegree: number,
  numNotesInChord: number
): string[] {
  return Array.from({ length: numNotesInChord }).map((_, i) => {
    return scaleNotes[(rootDegree + i * 2) % scaleNotes.length];
  });
}
