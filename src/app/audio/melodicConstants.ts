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

export const MOOD_TO_SCALE: Record<Mood, string> = {
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

export const MOODS: readonly Mood[] = [
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
