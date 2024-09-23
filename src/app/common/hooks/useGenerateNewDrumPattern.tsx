import { generateDrumPattern } from "audio/drumPatternGenerator";
import { useSetAtom } from "jotai";
import {
  closedHHPatternAtom,
  kickPatternAtom,
  openHHPatternAtom,
  snarePatternAtom,
} from "state";
import { useRenderAudioGraph } from "./useRenderAudioGraph";

export function useGenerateNewDrumPattern() {
  const setKickPattern = useSetAtom(kickPatternAtom);
  const setSnarePattern = useSetAtom(snarePatternAtom);
  const setClosedHHPattern = useSetAtom(closedHHPatternAtom);
  const setOpenHHPattern = useSetAtom(openHHPatternAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return async () => {
    const { kicks, snares, hihats, openHihats } = await generateDrumPattern();
    setKickPattern(kicks);
    setSnarePattern(snares);
    setClosedHHPattern(hihats);
    setOpenHHPattern(openHihats);
    renderAudioGraph({
      kickPattern: kicks,
      snarePattern: snares,
      closedHHPattern: hihats,
      openHHPattern: openHihats,
    });
  };
}
