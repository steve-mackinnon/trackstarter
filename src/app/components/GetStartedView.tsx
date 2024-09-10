import { Button } from "common/components/ui/button";
import { useGenerateNewSong } from "common/hooks/useGenerateNewSong";
import { useAtomValue } from "jotai";
import { chordProgressionAtom } from "state";

export function GetStartedView() {
  const harmony = useAtomValue(chordProgressionAtom);
  const generateNewSong = useGenerateNewSong();
  if (harmony) {
    return null;
  }
  return (
    <div
      className="z-50 absolute flex justify-center items-center bg-black bg-opacity-90 top-0 left-0 bottom-0 right-0"
      onClick={() => generateNewSong(null)}
    >
      <Button onClick={() => generateNewSong(null)}>Generate New Idea</Button>
    </div>
  );
}
