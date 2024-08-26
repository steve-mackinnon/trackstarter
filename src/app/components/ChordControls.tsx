import { regenerateChordAtIndex } from "audio/sequenceGenerator";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom, useSetAtom } from "jotai";
import { RefreshCw } from "lucide-react";
import { chordProgressionAtom, isPlayingAtom } from "state";

export function ChordControls({ chordIndex }: { chordIndex: number }) {
  const [chordProgression, setChordProgression] = useAtom(chordProgressionAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return (
    <button
      className="flex flex-col bg-emerald-700 hover:bg-emerald-500 active:bg-emerald-400 w-16 h-16 items-center justify-center rounded-lg"
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
  );
}
