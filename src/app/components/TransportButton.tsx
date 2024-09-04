import { start, stop } from "audio/audioGraph";
import { useAtom } from "jotai";
import { Pause, Play } from "lucide-react";
import { isPlayingAtom } from "state";

export function TransportButton() {
  const [playing, setPlaying] = useAtom(isPlayingAtom);

  return (
    <button
      className="p-4 justify-center items-center"
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
        <Pause key="stop" className="w-8 h-8" />
      ) : (
        <Play key="play" className="w-8 h-8" />
      )}
    </button>
  );
}
