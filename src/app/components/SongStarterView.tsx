"use client";

import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useGenerateSongOnFirstRender } from "hooks/useGenerateSongOnFirstRender";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";
import { XYPadContainer } from "./XYPadContainer";

export default function SongStarterView() {
  useSetupHotkeys();
  useGenerateSongOnFirstRender();

  return (
    <div className="absolute flex flex-col gap-y-4 w-full h-full py-20  items-center">
      <Header className="absolute top-4" />
      <XYPadContainer />
      <InstrumentSelectionContainer />
      <Footer className="absolute bottom-6" />
    </div>
  );
}
