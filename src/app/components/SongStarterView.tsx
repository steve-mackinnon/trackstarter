"use client";

import { stop } from "audio/audioGraph";
import { useGenerateSongOnFirstRender } from "hooks/useGenerateSongOnFirstRender";
import { useSetupHotkeys } from "hooks/useSetupHotkeys";
import { useEffect } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";
import { XYPadContainer } from "./XYPadContainer";

export default function SongStarterView() {
  useSetupHotkeys();
  useGenerateSongOnFirstRender();

  // Stop audio when this top-level component is unmounted
  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="absolute flex flex-col gap-y-4 w-full h-full py-20  items-center">
      <Header className="absolute top-4" />
      <XYPadContainer />
      <InstrumentSelectionContainer />
      <Footer className="absolute bottom-6" />
    </div>
  );
}
