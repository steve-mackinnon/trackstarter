import { setProperty } from "audio/audioGraph";
import { useAtom, useAtomValue } from "jotai";
import {
  harmonySynthParamsAtom,
  melodySynthParamsAtom,
  selectedInstrumentAtom,
} from "state";
import { FilterControlsContainer } from "./FilterControlsContainer";

export function XYPadContainer() {
  const [harmonySynthParams, setHarmonySynthParams] = useAtom(
    harmonySynthParamsAtom,
  );
  const [melodySynthParams, setMelodySynthParams] = useAtom(
    melodySynthParamsAtom,
  );
  const selectedInstrument = useAtomValue(selectedInstrumentAtom);

  return [
    {
      params: harmonySynthParams,
      instrument: "harmony",
      filterKey: "chord-prog-filter",
      setParams: setHarmonySynthParams,
    },
    {
      params: melodySynthParams,
      instrument: "melody",
      filterKey: "melody-filter",
      setParams: setMelodySynthParams,
    },
  ].map(({ params, instrument, filterKey, setParams }) => {
    if (selectedInstrument !== instrument) {
      return null;
    }
    return (
      <FilterControlsContainer
        key={instrument}
        params={params}
        onFreqChange={(freq) => {
          setParams((prevParams) => ({ ...prevParams, filterFrequency: freq }));
          setProperty(filterKey, "filter", "frequency", freq);
        }}
        onQChange={(q) => {
          setParams((prevParams) => ({ ...prevParams, filterQ: q }));
          setProperty(filterKey, "filter", "q", q);
        }}
      />
    );
  });
}
