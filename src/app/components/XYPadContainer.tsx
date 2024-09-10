import { setProperty } from "audio/audioGraph";
import {
  ParameterXYPad,
  ParamInfo as XYPadParamInfo,
} from "common/components/ParameterXYPad";
import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { linearMap } from "common/utils/parameterScaling";
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
  delay: ParameterInfo;
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
          const sustain = linearMap(decay, 0.05, 12, 0, 0.7);
          updateSynthParams((prev) => ({
            ...prev,
            decay: decay,
            sustain: sustain,
          }));
          setProperty(`${instrumentKey}-amp-env`, "adsr", "decay", decay);
          setProperty(`${instrumentKey}-amp-env`, "adsr", "sustain", sustain);
        },
      },
    },
    delay: {
      xParam: {
        min: 0.01,
        max: 1,
        scaling: 1,
        value: synthParams.delayParams.time,
        onChange: (time: number) => {
          updateSynthParams((prev) => {
            const prevDelay = { ...prev.delayParams };
            return { ...prev, delayParams: { ...prevDelay, time } };
          });
          setProperty(`${instrumentKey}-delay`, "delay", "time", time);
        },
      },
      yParam: {
        min: 0,
        max: 1,
        scaling: 1,
        value: synthParams.delayParams.sendAmount,
        onChange: (sendAmount: number) => {
          const feedback = sendAmount * 0.8;
          const lpfFrequency = linearMap(sendAmount, 0, 1, 800, 2000);
          updateSynthParams((prev) => {
            const prevDelay = { ...prev.delayParams };
            return {
              ...prev,
              delayParams: {
                ...prevDelay,
                sendAmount,
                feedback,
                lpfFrequency,
              },
            };
          });
          setProperty(
            `${instrumentKey}-delay-input`,
            "mul",
            "multiplier",
            sendAmount,
          );
          setProperty(`${instrumentKey}-delay`, "delay", "feedback", feedback);
          setProperty(
            `${instrumentKey}-delay-filter`,
            "filter",
            "frequency",
            lpfFrequency,
          );
        },
      },
    },
  };
}

function TabButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "rounded-none bg-primary-foreground select-none z-20 rounded-t-md text-md font-bold",
        { "bg-secondary hover:bg-secondary ": selected },
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function XYPadContainer() {
  const [harmonySynthParams, setHarmonySynthParams] = useAtom(
    harmonySynthParamsAtom,
  );
  const [melodySynthParams, setMelodySynthParams] = useAtom(
    melodySynthParamsAtom,
  );
  const [selectedControls, setSelectedControls] = useState<
    "filter" | "amp" | "delay"
  >("filter");
  const selectedInstrument = useAtomValue(selectedInstrumentAtom);

  const harmonySelected = selectedInstrument === "harmony";
  const paramMap = harmonySelected
    ? buildParamMap(harmonySynthParams, "harmony", setHarmonySynthParams)
    : buildParamMap(melodySynthParams, "melody", setMelodySynthParams);
  const params = (() => {
    switch (selectedControls) {
      case "amp":
        return paramMap.amp;
      case "delay":
        return paramMap.delay;
      case "filter":
        return paramMap.filter;
    }
  })();

  const borderColor = harmonySelected
    ? "var(--harmony-border-active)"
    : "var(--melody-border-active)";

  return (
    <div className="flex flex-col">
      <div className="flex space-x-[4px]">
        <TabButton
          label="tone"
          selected={selectedControls === "filter"}
          onClick={() => setSelectedControls("filter")}
        />
        <TabButton
          label="shape"
          selected={selectedControls === "amp"}
          onClick={() => setSelectedControls("amp")}
        />
        <TabButton
          label="delay"
          selected={selectedControls === "delay"}
          onClick={() => setSelectedControls("delay")}
        />
      </div>
      <div
        className={cn(
          "bg-secondary w-[316px] h-[316px] flex items-center justify-center rounded-b-xl rounded-br-xl rounded-tr-xl",
          { "rounded-tl-xl": selectedControls !== "filter" },
        )}
      >
        <ParameterXYPad
          key={`${selectedControls}-${selectedInstrument}`}
          borderColor={borderColor}
          xParam={params.xParam}
          yParam={params.yParam}
        />
      </div>
    </div>
  );
}
