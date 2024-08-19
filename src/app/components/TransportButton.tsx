import { start, stop } from "audio/audioGraph";
import { PlayCircle, StopCircle } from "lucide-react";
import { useState } from "react";

export function TransportButton() {
  const [playing, setPlaying] = useState(false);

  return (
    <button
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
      {playing ? <StopCircle /> : <PlayCircle />}
    </button>
  );
}
