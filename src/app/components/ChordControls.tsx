import { regenerateChordAtIndex } from "audio/sequenceGenerator";
import { useAtom, useSetAtom } from "jotai";
import { RefreshCw } from "lucide-react";
import { chordProgressionAtom, isPlayingAtom } from "state";

export function ChordControls({ chordIndex }: { chordIndex: number }) {
  const [chordProgression, setChordProgression] = useAtom(chordProgressionAtom);
  const chordName = chordProgression?.chordNames[chordIndex];
  const setIsPlaying = useSetAtom(isPlayingAtom);

  return (
    <button
      className="flex flex-col bg-emerald-700 hover:bg-emerald-500 active:bg-emerald-400 w-16 h-16 items-center justify-center"
      onClick={() => {
        if (!chordProgression) {
          return;
        }
        const prog = regenerateChordAtIndex(chordProgression, chordIndex);
        setChordProgression(prog);
        setIsPlaying(true);
      }}
    >
      {chordName}
      <RefreshCw className="w-4 h-4 mt-2" />
    </button>
  );
}
