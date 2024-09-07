import { expect, test } from "vitest";
import { parseChordProgression } from "./melodicUtils";
import { generateChordProgression } from "./sequenceGenerator";

test("generating chord progression produces the correct number of chords", () => {
  const progression = generateChordProgression({
    rootNote: "C",
    mood: "Mysterious",
    octave: 3,
    notesPerChord: 4,
  });
  expect(progression.chordNames.length).toBe(4);
});

test("parsing progression produces the correct number of chords", () => {
  const progression = "1-5-b6-3";
  const degrees = parseChordProgression(progression);
  expect(degrees.length).toBe(4);
});
