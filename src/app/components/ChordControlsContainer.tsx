import * as AudioGraph from "audio/audioGraph";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { chordProgressionAtom, isPlayingAtom } from "state";
import { ChordControls } from "./ChordControls";

export function ChordControlsContainer() {
  const chordProgression = useAtomValue(chordProgressionAtom);
  const [playingChordIndex, setPlayingChordIndex] = useState<number | null>(
    null
  );
  const isPlaying = useAtomValue(isPlayingAtom);
  const animationId = useRef<number>();

  useEffect(() => {
    const updatePlayingChordIndex = () => {
      if (!isPlaying) {
        setPlayingChordIndex(null);
      } else {
        const step = AudioGraph.getCurrentStep() % 64;
        const chordIndex = Math.floor(step / 16);
        setPlayingChordIndex(chordIndex);
      }
      animationId.current = requestAnimationFrame(updatePlayingChordIndex);
    };
    animationId.current = requestAnimationFrame(updatePlayingChordIndex);

    return () => {
      if (animationId.current !== undefined) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [isPlaying]);

  if (!chordProgression) {
    return null;
  }
  return (
    <div className="flex justify-between w-72">
      {chordProgression.chordNames.map((_, i) => (
        <ChordControls
          key={i}
          chordIndex={i}
          chordIsPlaying={playingChordIndex === i}
        />
      ))}
    </div>
  );
}
