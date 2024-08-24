import { start, stop } from "audio/audioGraph";
import { useAtom } from "jotai";
import { Play, Square } from "lucide-react";
import { isPlayingAtom } from "state";

export function TransportButton({ className }: { className: string }) {
  const [playing, setPlaying] = useAtom(isPlayingAtom);

  return (
    <button
      className={className + " w-10 h-10 justify-center items-center"}
      onClick={() => {
        const play = !playing;
        setPlaying(play);
        if (play) {
          start();
        } else {
          stop();
        }
      }}
    >
      {playing ? <Square className="w-8 h-8" /> : <Play className="w-8 h-8" />}
    </button>
  );
}
