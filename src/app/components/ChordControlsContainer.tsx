import { useAtomValue } from "jotai";
import { chordProgressionAtom } from "state";
import { ChordControls } from "./ChordControls";

export function ChordControlsContainer() {
  const chordProgression = useAtomValue(chordProgressionAtom);

  if (!chordProgression) {
    return null;
  }
  return (
    <div className="flex justify-between w-72">
      {chordProgression.chordNames.map((_, i) => (
        <ChordControls chordIndex={i} />
      ))}
    </div>
  );
}
