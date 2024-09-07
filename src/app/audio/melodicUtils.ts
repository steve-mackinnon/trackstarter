import { Chord, Interval, Note, Scale } from "tonal";

interface ChordProgression {
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
}): ChordProgression {
  const chordDegrees = parseChordProgression(progression);
  const notes = Scale.get(`${rootNote}${octave} ${scaleName}`);
  const chordNotes = chordDegrees.map((degree) =>
    chordForScale(notes, degree, notesPerChord),
  );
  return {
    chordNotes,
    chordNames: chordNotes.map((notes) => chordName(notes)),
  };
}

function chordName(notes: string[]): string {
  // Sort to get the chord with the smallest number of characters
  const chords = Chord.detect(notes);
  console.log(chords);
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
      note = Note.transpose(note, Interval.fromSemitones(shiftAmount));
    }
    const freq = Note.get(note).freq ?? 500;
    if (Math.random() < 0.3 && freq < 700) {
      // Shift up an octave
      note = Note.transpose(note, "8P");
    } else if (Math.random() < 0.3 && freq > 100) {
      // Shift down an octave
      note = Note.transpose(note, "-8P");
    }
    if (note === "") {
      throw new Error("Failed to generate note in chordForScale()");
    }
    return note;
  });
}
