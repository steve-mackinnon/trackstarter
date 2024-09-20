import { audioGraph } from "common/audio";
import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { isPlayingAtom } from "state";

export function useListenToPlaybackStateChanges() {
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const timeoutId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updatePlaybackState = () => {
      setIsPlaying(audioGraph.isPlaying());
      timeoutId.current = setTimeout(updatePlaybackState, 1000 / 60);
    };
    updatePlaybackState();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  });
}
