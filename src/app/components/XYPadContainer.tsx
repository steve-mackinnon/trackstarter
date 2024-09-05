import { setProperty } from "audio/audioGraph";
import {
  ParameterXYPad,
  ParamInfo as XYPadParamInfo,
} from "common/components/ParameterXYPad";
import { Button } from "common/components/ui/button";
import { useAtom, useAtomValue } from "jotai";
import { SetStateAction } from "jotai/vanilla";
import { useState } from "react";
import {
  harmonySynthParamsAtom,
  melodySynthParamsAtom,
  selectedInstrumentAtom,
  SynthParams,
} from "state";

interface ParameterInfo {
  xParam: XYPadParamInfo;
  yParam: XYPadParamInfo;
}

interface ParamMap {
  filter: ParameterInfo;
  amp: ParameterInfo;
}

function buildParamMap(
  synthParams: SynthParams,
  instrumentKey: string,
  updateSynthParams: (prev: SetStateAction<SynthParams>) => void,
): ParamMap {
  return {
    filter: {
      xParam: {
        min: 20,
        max: 20000,
        scaling: 3,
        value: synthParams.filterFrequency,
        onChange: (freq: number) => {
          updateSynthParams((prev) => ({ ...prev, filterFrequency: freq }));
          setProperty(`${instrumentKey}-filter`, "filter", "frequency", freq);
        },
      },
      yParam: {
        min: 0.1,
        max: 25,
        scaling: 3,
        value: synthParams.filterQ,
        onChange: (q: number) => {
          updateSynthParams((prev) => ({ ...prev, filterQ: q }));
          setProperty(`${instrumentKey}-filter`, "filter", "q", q);
        },
      },
    },
    amp: {
      xParam: {
        min: 0.01,
        max: 7,
        scaling: 3,
        value: synthParams.attack,
        onChange: (attack: number) => {
          updateSynthParams((prev) => ({ ...prev, attack: attack }));
          setProperty(`${instrumentKey}-amp-env`, "adsr", "attack", attack);
        },
      },
      yParam: {
        min: 0.05,
        max: 12,
        scaling: 3,
        value: synthParams.decay,
        onChange: (decay: number) => {
          updateSynthParams((prev) => ({ ...prev, decay: decay }));
          setProperty(`${instrumentKey}-amp-env`, "adsr", "decay", decay);
        },
      },
    },
  };
}
export function XYPadContainer() {
  const [harmonySynthParams, setHarmonySynthParams] = useAtom(
    harmonySynthParamsAtom,
  );
  const [melodySynthParams, setMelodySynthParams] = useAtom(
    melodySynthParamsAtom,
  );
  const [selectedControls, setSelectedControls] = useState<"filter" | "amp">(
    "filter",
  );
  const selectedInstrument = useAtomValue(selectedInstrumentAtom);

  const paramMap =
    selectedInstrument === "harmony"
      ? buildParamMap(harmonySynthParams, "harmony", setHarmonySynthParams)
      : buildParamMap(melodySynthParams, "melody", setMelodySynthParams);
  const params = selectedControls === "filter" ? paramMap.filter : paramMap.amp;
  const borderColor =
    selectedInstrument === "harmony"
      ? "var(--harmony-border-active)"
      : "var(--melody-border-active)";

  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button onClick={() => setSelectedControls("filter")}>Tone</Button>
        <Button onClick={() => setSelectedControls("amp")}>Shape</Button>
      </div>
      <ParameterXYPad
        key={`${selectedControls}-${selectedInstrument}`}
        borderColor={borderColor}
        xParam={params.xParam}
        yParam={params.yParam}
      />
    </div>
  );
}
