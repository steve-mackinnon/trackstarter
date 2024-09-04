"use client";

import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";
import { XYPadContainer } from "./XYPadContainer";

export default function SongStarterView() {
  useSetupHotkeys();

  return (
    <div className="absolute flex flex-col gap-y-4 w-full h-full py-32  items-center">
      <Header className="absolute top-4" />
      <XYPadContainer />
      <InstrumentSelectionContainer />
      <Footer className="absolute bottom-4" />
    </div>
  );
}
