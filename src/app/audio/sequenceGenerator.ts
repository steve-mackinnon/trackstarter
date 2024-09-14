import { Chord, Scale } from "tonal";
import { SequencerEvent } from "./audioGraph";
import {
  Mood,
  MOOD_TO_PROGRESSIONS,
  MOOD_TO_SCALE,
  MOODS,
} from "./melodicConstants";
import {
  chordForScale,
  chordsForProgression,
  parseChordProgression,
} from "./melodicUtils";

function getRandomValue<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * (array.length - 1))];
}

export function getRandomMood(): Mood {
  return getRandomValue(MOODS);
}

type Note =
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

export const NOTES: readonly Note[] = [
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
  const progression = getRandomValue(MOOD_TO_PROGRESSIONS[mood]);
  const { chordNotes, chordNames } = chordsForProgression({
    progression,
    scaleName: scale,
    octave,
    rootNote,
    notesPerChord,
  });
  return {
    chordNotes,
    chordNames,
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
  chords.sort((a, b) =>
    a.length < b.length ? -1 : a.length === b.length ? 0 : 1,
  );
  return chords[0];
}
