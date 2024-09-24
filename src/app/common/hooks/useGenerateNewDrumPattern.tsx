import { generateDrumPattern } from "audio/drumPatternGenerator";
import { useSetAtom } from "jotai";
import { drumsAtom } from "state";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewDrumPattern() {
  const renderAudioGraph = useRenderAudioGraph();
  const setDrums = useSetAtom(drumsAtom);

  return async () => {
    const { kicks, snares, closedHihats, openHihats } =
      await generateDrumPattern();
    const drums = {
      muted: false,
      kickPattern: kicks,
      snarePattern: snares,
      closedHHPattern: closedHihats,
      openHHPattern: openHihats,
    };
    setDrums(drums);
    renderAudioGraph({
      drums,
      startPlaybackIfStopped: true,
    });
  };
}
