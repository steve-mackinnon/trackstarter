import { Scale } from "tonal";
import { expect, test } from "vitest";
import { Mood, MOOD_TO_SCALES } from "./melodicConstants";

test("all scales can be parsed", () => {
  for (const mood of Object.keys(MOOD_TO_SCALES)) {
    for (const scale of MOOD_TO_SCALES[mood as Mood]) {
      const notes = Scale.get(`C ${scale}`).notes;
      if (notes.length === 0) {
        console.log(scale);
      }
      expect(notes.length).toBeGreaterThan(0);
    }
  }
});

test("c enigmatic", async () => {
  const notes = Scale.get("C enigmatic").notes;
  console.log(notes);
  expect(notes.length).toBeGreaterThan(0);
});
