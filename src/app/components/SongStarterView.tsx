"use client";

import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { ChordControlsContainer } from "./ChordControlsContainer";
import { ChordProgressionControls } from "./ChordProgressionControls";
import { MelodyControls } from "./MelodyControls";
import { TransportButton } from "./TransportButton";

export default function SongStarterView() {
  useSetupHotkeys();

  return (
    <div className="bg-black absolute flex flex-col gap-y-4 w-full h-full py-32  items-center">
      <TransportButton className="absolute flex top-5 " />
      <h2 className="text-2xl font-bold">Harmony</h2>
      <ChordProgressionControls />
      <ChordControlsContainer />
      <h2 className="text-2xl pt-8 font-bold">Melody</h2>
      <MelodyControls />
      {/* <ChordProgressionInfo /> */}
    </div>
  );
}
