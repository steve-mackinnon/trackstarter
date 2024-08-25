"use client";

import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { ChordProgressionView } from "./ChordProgressionView";
import { HarmonySynthControls } from "./HarmonySynthControls";
import { TransportButton } from "./TransportButton";

export function SongStarterView() {
  useSetupHotkeys();
  useRenderAudioGraph();

  return (
    <div className="bg-black absolute flex flex-col gap-y-1 w-full h-full justify-center items-center">
      <TransportButton className="absolute flex top-5 " />
      <ChordProgressionView />
      <HarmonySynthControls />
    </div>
  );
}
