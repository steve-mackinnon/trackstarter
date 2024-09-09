export type Mood =
  | "Uplifting"
  | "Dark"
  | "Exotic"
  | "Mysterious"
  | "Dramatic"
  | "Dreamy"
  | "Groovy"
  | "Surreal";

export const MOOD_TO_SCALE: Record<Mood, string> = {
  Dark: "aeolian",
  Dramatic: "harmonic minor",
  Dreamy: "lydian",
  Exotic: "phrygian",
  Groovy: "mixolydian",
  Mysterious: "whole tone",
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
    "1-b6-b7-5",
    "1-4-b6-5",
    "1-b2-4-5",
    "6-5-4-3",
    "1-3-b6-b2",
    "1-b3-b7-b6",
    "1-b5-4-b2",
    "1-b7-b6-5",
    "1-b7-b6-4",
    "1-b3-4-5",
  ],
  Exotic: [
    "1-b2-5-1",
    "1-4-b2-5",
    "1-b3-4-1",
    "1-2-5-b2",
    "1-b7-b2-1",
    "1-b5-5-1",
    "1-b2-b3-1",
    "1-#4-5-1",
    "1-4-b7-1",
    "1-b5-b7-1",
  ],
  Mysterious: [
    "1-b6-4-b7",
    "1-b7-b6-5",
    "1-5-b6-3",
    "1-b2-1-5",
    "1-4-b7-3",
    "1-b7-1-b7",
    "b6-b7-1-3",
    "1-b7-b6-5",
    "1-b6-3-b7",
    "1-4-2-b7",
  ],
  Dramatic: [
    "1-5-6-4",
    "1-4-5-1",
    "6-4-1-5",
    "1-b7-b6-5",
    "1-5-4-b7",
    "1-b7-4-5",
    "6-5-4-5",
    "1-b7-4-1",
    "1-4-5-4",
    "1-5-4-1",
  ],
  Dreamy: [
    "1-5-4-5",
    "1-6-4-5",
    "1-2-5-4",
    "1-5-6-5",
    "4-1-5-1",
    "6-4-1-5",
    "1-5-4-5",
    "1-4-b7-5",
    "1-4-b7-4",
    "1-2-5-1",
  ],
  Groovy: [
    "1-7-4-5",
    "1-6-2-5",
    "1-4-b7-1",
    "1-5-2-6",
    "1-7-6-5",
    "1-4-5-4",
    "1-b3-4-5",
    "1-b7-4-b6",
    "1-5-6-5",
    "1-b7-4-5",
  ],
  Surreal: [
    "1-b2-4-b6",
    "1-b5-4-b7",
    "1-#4-5-#5",
    "1-b2-5-1",
    "1-b3-4-b5",
    "1-#4-4-5",
    "1-4-b6-b2",
    "1-b6-b3-b7",
    "1-#5-4-5",
    "1-b7-b6-b5",
  ],
} as const;

export const MOODS: readonly Mood[] = [
  "Uplifting",
  "Dark",
  "Dramatic",
  "Dreamy",
  "Exotic",
  "Groovy",
  "Mysterious",
  "Surreal",
];
