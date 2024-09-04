import { Chord, Interval, NoteWithOctave, Scale, Note as TNote } from "tonal";
import { SequencerEvent } from "./audioGraph";

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

export const MOOD_TO_PROGRESSIONS = {
  Uplifting: [
    "1-5-6-4",
    "1-4-5-4",
    "1-5-4-5",
    "1-6-4-5",
    "1-4-2-5",
    "1-5-3-4",
    "1-2-5-1",
    "4-1-5-1",
    "1-3-4-5",
    "1-4-5-1",
  ],
  Dark: [
    "1-6-7-5",
    "1-4-6-5",
    "1-2-4-5",
    "6-5-4-3",
    "1-3-6-2",
    "1-3-7-6",
    "1-5-4-2",
    "1-7-6-5",
    "1-7-6-4",
    "1-3-4-5",
  ],
  Exotic: [
    "1-2-5-1",
    "1-4-2-5",
    "1-3-4-1",
    "1-2-5-2",
    "1-7-2-1",
    "1-5-5-1",
    "1-2-3-1",
    "1-#4-5-1",
    "1-4-7-1",
    "1-5-7-1",
  ],
  Mysterious: [
    "1-6-4-7",
    "1-7-6-5",
    "1-5-6-3",
    "1-2-1-5",
    "1-4-7-3",
    "1-7-1-7",
    "6-7-1-3",
    "1-7-6-5",
    "1-6-3-7",
    "1-4-2-7",
  ],
  Dramatic: [
    "1-5-6-4",
    "1-4-5-1",
    "6-4-1-5",
    "1-7-6-5",
    "1-5-4-7",
    "1-7-4-5",
    "6-5-4-5",
    "1-7-4-1",
    "1-4-5-4",
    "1-5-4-1",
  ],
  Sophisticated: [
    "2-5-1-4",
    "1-2-4-7",
    "4-5-3-6",
    "2-5-1-7",
    "1-5-2-4",
    "1-#4-4-3",
    "2-5-4-3",
    "1-6-2-5",
    "1-4-7-3",
    "1-2-3-4",
  ],
  Dreamy: [
    "1-5-4-5",
    "1-6-4-5",
    "1-2-5-4",
    "1-5-6-5",
    "4-1-5-1",
    "6-4-1-5",
    "1-5-4-5",
    "1-4-7-5",
    "1-4-7-4",
    "1-2-5-1",
  ],
  Groovy: [
    "1-7-4-5",
    "1-6-2-5",
    "1-4-7-1",
    "1-5-2-6",
    "1-7-6-5",
    "1-4-5-4",
    "1-3-4-5",
    "1-7-4-6",
    "1-5-6-5",
    "1-7-4-5",
  ],
  Surreal: [
    "1-2-4-6",
    "1-5-4-7",
    "1-#4-5-#5",
    "1-2-5-1",
    "1-3-4-5",
    "1-#4-4-5",
    "1-4-6-2",
    "1-6-3-7",
    "1-#5-4-5",
    "1-7-6-5",
  ],
} as const;

export const MOODS: Mood[] = [
  "Uplifting",
  "Dark",
  "Dramatic",
  "Dreamy",
  "Exotic",
  "Groovy",
  "Mysterious",
  "Sophisticated",
  "Surreal",
];

function getRandomValue<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * (array.length - 1))];
}

interface ScaleDegree {
  index: number;
  alteration?: "sharp" | "flat";
}

export function parseChordProgression(progression: string): ScaleDegree[] {
  return progression.split("-").map((chord) => {
    const alteration = chord.startsWith("b")
      ? "flat"
      : chord.startsWith("#")
      ? "sharp"
      : undefined;
    const skipFirstChar = alteration !== undefined;
    return {
      index: parseInt(chord.slice(skipFirstChar ? 1 : 0), 10) - 1,
      alteration,
    };
  });
}

export function getRandomMood(): Mood {
  return getRandomValue(MOODS);
}

export type Note =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

const NOTES: Note[] = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
];
export function getRandomNote(): Note {
  return getRandomValue(NOTES);
}

export function generateSequence(
  mood: Mood,
  length: number,
  root: Note,
  octave: number,
): NoteWithOctave[] {
  const scale = MOOD_TO_SCALE[mood];
  const notes = Scale.get(`${root}${octave} ${scale}`).notes;
  return Array.from({ length }).map(
    () =>
      notes[
        Math.floor(Math.random() * (notes.length - 1)) % (notes.length - 1)
      ] as Note,
  );
}

export interface ChordProgression {
  chordNotes: string[][];
  chordNames: string[];
  progression: string;
  scale: string;
  rootNote: string;
  mood: Mood;
  octave: number;
}

export function generateChordProgression({
  rootNote,
  mood,
  notesPerChord,
  octave,
}: {
  rootNote: Note;
  mood: Mood;
  notesPerChord: number;
  octave: number;
}): ChordProgression {
  const scale = MOOD_TO_SCALE[mood];
  const notes = Scale.get(`${rootNote}${octave} ${scale}`);
  const progression = getRandomValue(MOOD_TO_PROGRESSIONS[mood]);
  const chordDegrees = parseChordProgression(
    getRandomValue(MOOD_TO_PROGRESSIONS[mood]),
  );
  const chordNotes = chordDegrees.map((degree) =>
    chordForScale(notes, degree, notesPerChord),
  );
  return {
    chordNotes,
    chordNames: chordNotes.map((notes) => chordName(notes)),
    progression,
    scale,
    mood,
    rootNote,
    octave,
  };
}

export function chordProgressionToSequencerEvents(
  progression: string[][],
): SequencerEvent[] {
  const events: SequencerEvent[] = [];
  progression.forEach((chord, chordIndex) => {
    chord.forEach((note) => {
      events.push({
        note,
        startStep: chordIndex * 16,
        endStep: chordIndex * 16 + 16,
      });
    });
  });
  return events;
}

export function chordForScale(
  scale: Scale.Scale,
  rootDegree: ScaleDegree,
  numNotesInChord: number,
): string[] {
  return Array.from({ length: numNotesInChord }).map((_, i) => {
    let note = scale.notes[(rootDegree.index + i * 2) % scale.notes.length];
    if (rootDegree.alteration && i === 0) {
      // Sharpen or flatten the root if requested
      const shiftAmount = rootDegree.alteration === "flat" ? -1 : 1;
      note = TNote.transpose(note, Interval.fromSemitones(shiftAmount));
    }
    const freq = TNote.get(note).freq ?? 500;
    if (Math.random() < 0.3 && freq < 700) {
      // Shift up an octave
      note = TNote.transpose(note, "8P");
    } else if (Math.random() < 0.3 && freq > 100) {
      // Shift down an octave
      note = TNote.transpose(note, "-8P");
    }
    if (note === "") {
      throw new Error("Failed to generate note in chordForScale()");
    }
    return note;
  });
}

export function regenerateChordAtIndex(
  chordProgression: ChordProgression,
  index: number,
): ChordProgression {
  const degrees = parseChordProgression(chordProgression?.progression);
  const numNotesInChord = chordProgression.chordNotes[0].length;
  const scale = Scale.get(
    `${chordProgression.rootNote}${chordProgression.octave} ${chordProgression.scale}`,
  );
  const refreshedChord = chordForScale(scale, degrees[index], numNotesInChord);
  const chordNotes = [...chordProgression.chordNotes];
  chordNotes[index] = refreshedChord;
  return { ...chordProgression, chordNotes };
}

function chordName(notes: string[]): string {
  // Sort to get the chord with the smallest number of characters
  const chords = Chord.detect(notes);
  console.log(chords);
  chords.sort((a, b) =>
    a.length < b.length ? -1 : a.length === b.length ? 0 : 1,
  );
  console.log(`Sorted: ${chords}`);
  return chords[0];
}
