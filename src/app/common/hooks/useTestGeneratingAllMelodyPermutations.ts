import {
  MOOD_TO_PROGRESSIONS,
  MOOD_TO_SCALES,
  MOODS,
} from "audio/melodicConstants";
import { chordsForProgression } from "audio/melodicUtils";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { useEffect } from "react";

// This hook is for running an in-browser test that verifies that every
// possible chord progression permutation generates a melody when passed
// to magenta.
export function useTestGeneratingAllMelodyPermutations() {
  useEffect(() => {
    const runTest = async () => {
      const testSet: Set<string> = new Set();
      // for (const rootNote of NOTES) {
      const rootNote = "C";
      for (const mood of MOODS) {
        for (const progression of MOOD_TO_PROGRESSIONS[mood]) {
          for (const scaleName of MOOD_TO_SCALES[mood]) {
            const key = `${rootNote} ${scaleName} ${progression}`;
            if (testSet.has(key)) {
              console.log(`skipping ${key} - already tested`);
              continue;
            }
            testSet.add(key);
            console.log(`testing ${key}`);
            const { chordNames } = chordsForProgression({
              progression,
              scaleName,
              octave: 3,
              rootNote,
              notesPerChord: 4,
            });
            const melody = await generateMelodyForChordProgression(
              chordNames,
              scaleName,
              rootNote,
            );
            if (!melody) {
              throw new Error(
                `Failed to generate melody for ${rootNote} ${scaleName} ${progression}: ${chordNames}`,
              );
            }
          }
        }
      }
      // }
    };

    runTest();
  });
}
