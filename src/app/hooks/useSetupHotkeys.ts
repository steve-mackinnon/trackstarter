import { start, stop } from "audio/audioGraph";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { isPlayingAtom } from "state";

export function useSetupHotkeys() {
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": {
          e.preventDefault();
          const playing = !isPlaying;
          setIsPlaying(playing);
          if (playing) {
            start();
          } else {
            stop();
          }
          break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, setIsPlaying]);
}
