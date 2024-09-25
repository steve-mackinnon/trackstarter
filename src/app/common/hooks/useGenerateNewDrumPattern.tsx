import { generateDrumPattern } from "audio/drumPatternGenerator";
import { useAtom } from "jotai";
import { drumsAtom } from "state";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewDrumPattern() {
  const renderAudioGraph = useRenderAudioGraph();
  const [drums, setDrums] = useAtom(drumsAtom);

  return async (intensity: "low" | "medium" | "high") => {
    const { kicks, snares, closedHihats, openHihats } =
      await generateDrumPattern(intensity, drums.patternLength);
    const newDrums = {
      patternGenIntensity: intensity,
      patternLength: drums.patternLength,
      muted: false,
      kickPattern: kicks,
      snarePattern: snares,
      closedHHPattern: closedHihats,
      openHHPattern: openHihats,
    };
    setDrums(newDrums);
    renderAudioGraph({
      drums: newDrums,
      startPlaybackIfStopped: true,
    });
  };
}
