"use client";

import { audioGraph } from "common/audio";
import { useGenerateSongOnFirstRender } from "hooks/useGenerateSongOnFirstRender";
import { useListenToPlaybackStateChanges } from "hooks/useListenToPlaybackStateChanges";
import { useSetupHotkeys } from "hooks/useSetupHotkeys";
import { useEffect } from "react";
import { ChatPrompt } from "./ChatPrompt";
import { DrumControls } from "./DrumControls";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";
import { MelodicInfoReadout } from "./MelodicInfoReadout";
import { PresetSelector } from "./PresetSelector";
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
    <div className="absolute flex flex-col gap-y-4 w-full h-full py-16  items-center">
      <Header className="absolute top-4" />
      <MelodicInfoReadout />
      <PresetSelector />
      <ChatPrompt />
      <XYPadContainer />
      <InstrumentSelectionContainer />
      <DrumControls />
      <TransportButton className="sm:absolute bottom-2 self-center" />
    </div>
  );
}
