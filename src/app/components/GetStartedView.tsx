import { Button } from "common/components/ui/button";
import { useGenerateNewChordProgression } from "common/hooks/useGenerateNewChordProgression";
import { useAtomValue } from "jotai";
import { chordProgressionAtom } from "state";

export function GetStartedView() {
  const harmony = useAtomValue(chordProgressionAtom);
  const generateNewChordProgression = useGenerateNewChordProgression();
  if (harmony) {
    return null;
  }
  return (
    <div
      className="z-50 absolute flex justify-center items-center bg-black bg-opacity-90 top-0 left-0 bottom-0 right-0"
      onClick={() => generateNewChordProgression(null)}
    >
      <Button onClick={() => generateNewChordProgression(null)}>
        Generate New Idea
      </Button>
    </div>
  );
}
