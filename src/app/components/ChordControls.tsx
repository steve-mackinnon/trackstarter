import { regenerateChordAtIndex } from "audio/sequenceGenerator";
import classNames from "classnames";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom, useSetAtom } from "jotai";
import { RefreshCw } from "lucide-react";
import { chordProgressionAtom, isPlayingAtom } from "state";

export function ChordControls({
  chordIndex,
  chordIsPlaying,
}: {
  chordIndex: number;
  chordIsPlaying: boolean;
}) {
  const [chordProgression, setChordProgression] = useAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const renderAudioGraph = useRenderAudioGraph();

  const className = classNames(
    "flex flex-col bg-emerald-700 hover:bg-emerald-500 active:bg-emerald-400 w-16 h-16 items-center justify-center rounded-lg",
    {
      "bg-sky-400 hover:bg-sky-300 active:bg-sky-200": chordIsPlaying,
    },
  );
  return (
    <div className="flex justify-center flex-col items-center space-y-2">
      <button
        className={className}
        onClick={() => {
          if (!chordProgression) {
            return;
          }
          const prog = regenerateChordAtIndex(chordProgression, chordIndex);
          setChordProgression(prog);
          // TODO constant for chord length
          renderAudioGraph({ progression: prog, startStep: chordIndex * 16 });
          setIsPlaying(true);
        }}
      >
        {chordIndex + 1}
        <RefreshCw className="w-4 h-4 mt-2" />
      </button>
      <label className="text-slate-300">
        {chordProgression?.chordNames[chordIndex]}
      </label>
    </div>
  );
}
