import {
  MOOD_TO_PROGRESSIONS,
  MOOD_TO_SCALE,
  MOODS,
} from "audio/melodicConstants";
import { chordsForProgression } from "audio/melodicUtils";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { NOTES } from "audio/sequenceGenerator";
import { useEffect } from "react";

// This hook is for running an in-browser test that verifies that every
// possible chord progression permutation generates a melody when passed
// to magenta.
export function useTestGeneratingAllMelodyPermutations() {
  useEffect(() => {
    const runTest = async () => {
      for (const rootNote of NOTES) {
        for (const mood of MOODS) {
          for (const progression of MOOD_TO_PROGRESSIONS[mood]) {
            const scaleName = MOOD_TO_SCALE[mood];
            console.log(`testing ${rootNote} ${scaleName} ${progression}`);
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
              3,
            );
            if (!melody) {
              throw new Error(
                `Failed to generate melody for ${rootNote} ${scaleName} ${progression}: ${chordNames}`,
              );
            }
          }
        }
      }
    };
    runTest();
  });
}
