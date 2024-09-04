"use client";

import { setProperty } from "audio/audioGraph";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useAtom, useAtomValue } from "jotai";
import {
  harmonySynthParamsAtom,
  melodySynthParamsAtom,
  selectedInstrumentAtom,
} from "state";
import { FilterControlsContainer } from "./FilterControlsContainer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InstrumentSelectionContainer } from "./InstrumentSelectionContainer";

export default function SongStarterView() {
  useSetupHotkeys();

  const [harmonySynthParams, setHarmonySynthParams] = useAtom(
    harmonySynthParamsAtom,
  );
  const [melodySynthParams, setMelodySynthParams] = useAtom(
    melodySynthParamsAtom,
  );
  const selectedInstrument = useAtomValue(selectedInstrumentAtom);

  return (
    <div className="absolute flex flex-col gap-y-4 w-full h-full py-32  items-center">
      <Header className="absolute top-4" />
      <FilterControlsContainer
        params={harmonySynthParams}
        onFreqChange={(freq) => {
          if (selectedInstrument === "harmony") {
            setHarmonySynthParams({
              ...harmonySynthParams,
              filterFrequency: freq,
            });
            setProperty("chord-prog-filter", "filter", "frequency", freq);
          } else if (selectedInstrument === "melody") {
            setMelodySynthParams({
              ...harmonySynthParams,
              filterFrequency: freq,
            });
            setProperty("melody-filter", "filter", "frequency", freq);
          }
        }}
        onQChange={(q) => {
          if (selectedInstrument === "harmony") {
            setHarmonySynthParams({ ...harmonySynthParams, filterQ: q });
            setProperty("chord-prog-filter", "filter", "q", q);
          } else if (selectedInstrument === "melody") {
            setMelodySynthParams({ ...melodySynthParams, filterQ: q });
            setProperty("melody-filter", "filter", "q", q);
          }
        }}
      />
      {/* <ChordProgressionControls /> */}
      {/* <ChordControlsContainer /> */}
      {/* <MelodyControls /> */}
      <InstrumentSelectionContainer />
      <Footer className="absolute bottom-4" />
      {/* <ChordProgressionInfo /> */}
    </div>
  );
}
