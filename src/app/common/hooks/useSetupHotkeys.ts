import { start, stop } from "audio/audioGraph";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { cursorModeAtom, isPlayingAtom } from "state";

export function useSetupHotkeys() {
  const setCursorMode = useSetAtom(cursorModeAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": {
          setCursorMode("selection");
          break;
        }
        case "1": {
          setCursorMode("selection");
          break;
        }
        case "2": {
          setCursorMode("osc");
          break;
        }
        case "3": {
          setCursorMode("filter");
          break;
        }
        case "4": {
          setCursorMode("sequencer");
          break;
        }
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
  }, [isPlaying, setIsPlaying, setCursorMode]);
}
