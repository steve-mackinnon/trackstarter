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

  const harmonySelected = selectedInstrument === "harmony";
  const paramMap = harmonySelected
    ? buildParamMap(harmonySynthParams, "harmony", setHarmonySynthParams)
    : buildParamMap(melodySynthParams, "melody", setMelodySynthParams);
  const params = selectedControls === "filter" ? paramMap.filter : paramMap.amp;
  const borderColor = harmonySelected
    ? "var(--harmony-border-active)"
    : "var(--melody-border-active)";

  const filterSelected = selectedControls === "filter";
  return (
    <div className="flex flex-col">
      <div className="flex space-x-[2px]">
        <Button
          variant="secondary"
          className="rounded-none rounded-tl-lg"
          style={{
            backgroundColor: filterSelected
              ? "hsl(var(--secondary))"
              : "hsl(var(--primary-foreground))",
          }}
          onClick={() => setSelectedControls("filter")}
        >
          Tone
        </Button>
        <Button
          variant={"secondary"}
          className="rounded-none rounded-tr-lg"
          style={{
            backgroundColor: !filterSelected
              ? "hsl(var(--secondary))"
              : "hsl(var(--primary-foreground))",
          }}
          onClick={() => setSelectedControls("amp")}
        >
          Shape
        </Button>
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
