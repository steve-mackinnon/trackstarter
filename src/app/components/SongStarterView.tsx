"use client";

import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { ChordControlsContainer } from "./ChordControlsContainer";
import { ChordProgressionControls } from "./ChordProgressionControls";
import { ChordProgressionInfo } from "./ChordProgressionInfo";
import { TransportButton } from "./TransportButton";

export default function SongStarterView() {
  useSetupHotkeys();
  useRenderAudioGraph();

  return (
    <div className="bg-black absolute flex flex-col gap-y-4 w-full h-full py-32  items-center">
      <TransportButton className="absolute flex top-5 " />
      <ChordProgressionControls />
      <ChordControlsContainer />
      <ChordProgressionInfo />
    </div>
  );
}
