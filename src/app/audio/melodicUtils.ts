import { Chord, Interval, Note, Scale } from "tonal";
import { ChordProgression } from "./sequenceGenerator";

interface ChordProgressionInfo {
  chordNames: string[];
  chordNotes: string[][];
}

export function chordsForProgression({
  progression,
  scaleName,
  octave,
  rootNote,
  notesPerChord,
}: {
  progression: string;
  scaleName: string;
  octave: number;
  rootNote: string;
  notesPerChord: number;
}): ChordProgressionInfo {
  const chordDegrees = parseChordProgression(progression);
  const scale = Scale.get(`${rootNote}${octave} ${scaleName}`);
  const chordNotes = chordDegrees.map((degree) =>
    chordForScale(scale.notes, degree, notesPerChord),
  );
  return {
    chordNotes,
    chordNames: chordNotes.map((notes) => chordName(notes)),
  };
}

function chordName(notes: string[]): string {
  // Sort to get the chord with the smallest number of characters
  const chords = Chord.detect(notes);
  chords.sort((a, b) =>
    a.length < b.length ? -1 : a.length === b.length ? 0 : 1,
  );
  return chords[0];
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

function applyRandomOctaveShift(note: string): string {
  const freq = Note.get(note).freq ?? 500;
  if (Math.random() < 0.3 && freq < 700) {
    // Shift up an octave
    return Note.transpose(note, "8P");
  } else if (Math.random() < 0.3 && freq > 100) {
    // Shift down an octave
    return Note.transpose(note, "-8P");
  }
  return note;
}

export function chordForScale(
  scale: string[],
  rootDegree: ScaleDegree,
  chordLength: number,
): string[] {
  return Array.from({ length: chordLength }).map((_, i) => {
    const noteIndex = rootDegree.index + i * 2;
    let note = scale[noteIndex % scale.length];
    const octaveShift = Math.floor(noteIndex / scale.length) * 12;
    const alterationShift = (() => {
      if (rootDegree.alteration && i === 0) {
        return rootDegree.alteration === "flat" ? -1 : 1;
      }
      return 0;
    })();
    return applyRandomOctaveShift(
      Note.transpose(
        note,
        Interval.fromSemitones(octaveShift + alterationShift),
      ),
    );
  });
}

export function removeFlatChords(
  progression: ChordProgression,
): ChordProgression {
  const progressionWithoutFlats = progression.progression.replaceAll("b", "");
  const { chordNames, chordNotes } = chordsForProgression({
    progression: progressionWithoutFlats,
    scaleName: progression.scale,
    octave: progression.octave,
    rootNote: progression.rootNote,
    notesPerChord: progression.chordNotes[0].length,
  });
  return {
    ...progression,
    progression: progressionWithoutFlats,
    chordNames,
    chordNotes,
  };
}
