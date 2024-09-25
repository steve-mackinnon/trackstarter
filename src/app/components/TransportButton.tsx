import { audioGraph } from "common/audio";
import { cn } from "common/utils";
import { useAtom } from "jotai";
import { Pause, Play } from "lucide-react";
import { isPlayingAtom } from "state";

export function TransportButton({ className }: { className?: string }) {
  const [playing, setPlaying] = useAtom(isPlayingAtom);

  return (
    <button
      className={cn("p-4 justify-center items-center", className)}
      onClick={() => {
        const play = !playing;
        setPlaying(play);
        if (play) {
          audioGraph.start();
        } else {
          audioGraph.stop();
        }
      }}
    >
      {playing ? (
        <Pause key="stop" className="w-8 h-8" />
      ) : (
        <Play key="play" className="w-8 h-8" />
      )}
    </button>
  );
}
