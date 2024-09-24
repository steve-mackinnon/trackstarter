"use client";

import { audioGraph } from "common/audio";
import { useGenerateSongOnFirstRender } from "hooks/useGenerateSongOnFirstRender";
import { useListenToPlaybackStateChanges } from "hooks/useListenToPlaybackStateChanges";
import { useSetupHotkeys } from "hooks/useSetupHotkeys";
import { useEffect } from "react";
import { DrumControls } from "./DrumControls";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";
import { TransportButton } from "./TransportButton";
import { XYPadContainer } from "./XYPadContainer";

export default function SongStarterView() {
  useSetupHotkeys();
  useGenerateSongOnFirstRender();
  useListenToPlaybackStateChanges();

  // Stop audio when this top-level component is unmounted
  useEffect(() => {
    return () => audioGraph.stop();
  }, []);

  return (
    <div className="absolute flex flex-col gap-y-2 sm:gap-y-4 w-full h-full py-20  items-center">
      <Header className="absolute top-4" />
      <XYPadContainer />
      <InstrumentSelectionContainer />
      <div className="flex gap-x-14 sm:gap-x-0 items-center sm:justify-center justify-between">
        <div></div>
        <DrumControls />
        <TransportButton className="sm:absolute sm:bottom-2 self-end" />
      </div>
    </div>
  );
}
