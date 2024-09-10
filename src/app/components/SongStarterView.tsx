"use client";

import { useGenerateNewSong } from "common/hooks/useGenerateNewSong";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useEffect, useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";
import { XYPadContainer } from "./XYPadContainer";

export default function SongStarterView() {
  useSetupHotkeys();
  const [initialLoad, setInitialLoad] = useState(true);
  const generateNewSong = useGenerateNewSong();

  useEffect(() => {
    if (!initialLoad) {
      return;
    }
    setInitialLoad(false);
    generateNewSong(null);
  }, [initialLoad, setInitialLoad, generateNewSong]);

  return (
    <div className="absolute flex flex-col gap-y-4 w-full h-full py-20  items-center">
      <Header className="absolute top-4" />
      <XYPadContainer />
      <InstrumentSelectionContainer />
      <Footer className="absolute bottom-6" />
    </div>
  );
}
