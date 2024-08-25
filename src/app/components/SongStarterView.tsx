"use client";

import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useUpdateAudioGraphOnStateChange } from "common/hooks/useUpdateAudioGraphOnStateChange";
import { ChordProgressionView } from "./ChordProgressionView";
import { TransportButton } from "./TransportButton";

export function SongStarterView() {
  useSetupHotkeys();
  useUpdateAudioGraphOnStateChange();

  return (
    <div className="bg-black absolute flex flex-col gap-y-1 w-full h-full justify-center items-center">
      <TransportButton className="absolute flex top-5 " />
      <ChordProgressionView />
    </div>
  );
}
