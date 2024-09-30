import { useAtomValue } from "jotai";
import { chordProgressionAtom } from "state";

export function MelodicInfoReadout() {
  const chordProgression = useAtomValue(chordProgressionAtom);

  if (!chordProgression) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-4">
      <span className="text-sm font-normal">{`${chordProgression.rootNote}`}</span>
      <span className="text-sm font-normal">{`${chordProgression.scale}`}</span>
      <span className="text-sm font-normal">{`${chordProgression.progression}`}</span>
    </div>
  );
}
