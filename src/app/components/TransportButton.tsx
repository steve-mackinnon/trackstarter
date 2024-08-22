import { start, stop } from "audio/audioGraph";
import { Play, Square } from "lucide-react";
import { useState } from "react";

export function TransportButton({ className }: { className: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <button
      className={className}
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
      {playing ? (
        <Square className="w-8 h-8" />
      ) : (
        <Play className="w-8 h-8" />
      )}
    </button>
  );
}
