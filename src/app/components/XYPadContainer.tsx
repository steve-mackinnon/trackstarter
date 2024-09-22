import { audioGraph } from "common/audio";
import { LFOControls } from "common/components/LFOControls";
import {
  ParameterXYPad,
  ParamInfo as XYPadParamInfo,
} from "common/components/ParameterXYPad";
import { Button } from "common/components/ui/button";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
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
  zeroSustain: boolean,
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
          audioGraph.setProperty(
            `${instrumentKey}-filter`,
            "filter",
            "frequency",
            freq,
          );
        },
      },
      yParam: {
        min: 0.1,
        max: 25,
        scaling: 3,
        value: synthParams.filterQ,
        onChange: (q: number) => {
          updateSynthParams((prev) => ({ ...prev, filterQ: q }));
          audioGraph.setProperty(`${instrumentKey}-filter`, "filter", "q", q);
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
          audioGraph.setProperty(
            `${instrumentKey}-amp-env`,
            "adsr",
            "attack",
            attack,
          );
        },
      },
      yParam: {
        min: 0.05,
        max: 3,
        scaling: 3,
        value: synthParams.decay,
        onChange: (decay: number) => {
          const sustain = zeroSustain ? 0 : linearMap(decay, 0.05, 3, 0, 0.7);
          const release = decay * 0.5;
          updateSynthParams((prev) => ({
            ...prev,
            decay: decay,
            sustain: sustain,
            release,
          }));
          audioGraph.setProperty(
            `${instrumentKey}-amp-env`,
            "adsr",
            "decay",
            decay,
          );
          audioGraph.setProperty(
            `${instrumentKey}-amp-env`,
            "adsr",
            "release",
            release,
          );

          audioGraph.setProperty(
            `${instrumentKey}-amp-env`,
            "adsr",
            "sustain",
            sustain,
          );
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
          audioGraph.setProperty(
            `${instrumentKey}-delay`,
            "delay",
            "time",
            time,
          );
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
          audioGraph.setProperty(
            `${instrumentKey}-delay-input`,
            "mul",
            "multiplier",
            sendAmount,
          );
          audioGraph.setProperty(
            `${instrumentKey}-delay`,
            "delay",
            "feedback",
            feedback,
          );
          audioGraph.setProperty(
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

interface LFOParam {
  min: number;
  max: number;
  scaling: number;
  value: number;
  onChange: (value: number) => void;
}
interface LFOParams {
  rate: LFOParam;
  amount: LFOParam;
  label: string;
}

interface LfoParamMap {
  filter: LFOParams[];
  amp?: undefined;
  delay?: undefined;
}

function buildLfoParamMap(
  synthParams: SynthParams,
  instrumentKey: string,
  updateSynthParams: (prev: SetStateAction<SynthParams>) => void,
  renderAudioGraph: (params: SynthParams) => void,
): LfoParamMap {
  return {
    filter: [
      {
        label: "filter",
        rate: {
          min: 0.01,
          max: 20,
          scaling: 4,
          value: synthParams.filterLFO.rate,
          onChange: (rate: number) => {
            updateSynthParams((prev) => ({
              ...prev,
              filterLFO: {
                ...prev.filterLFO,
                rate,
              },
            }));
            audioGraph.setProperty(
              `${instrumentKey}-filter-lfo`,
              "lfo",
              "frequency",
              rate,
            );
          },
        },
        amount: {
          min: 0,
          max: 5000,
          scaling: 5,
          value: synthParams.filterLFO.amount,
          onChange: (amount: number) => {
            let synthParams: SynthParams;
            updateSynthParams((prev) => {
              synthParams = {
                ...prev,
                filterLFO: {
                  ...prev.filterLFO,
                  amount,
                },
              };
              renderAudioGraph(synthParams);
              return synthParams;
            });
          },
        },
      },
      {
        label: "osc",
        rate: {
          min: 0.01,
          max: 16,
          scaling: 3,
          value: synthParams.oscFrequencyLFO.rate,
          onChange: (rate: number) => {
            updateSynthParams((prev) => ({
              ...prev,
              oscFrequencyLFO: {
                ...prev.oscFrequencyLFO,
                rate,
              },
            }));
            audioGraph.setProperty(
              `${instrumentKey}-osc-frequency-lfo`,
              "lfo",
              "frequency",
              rate,
            );
          },
        },
        amount: {
          min: 0,
          max: 30,
          scaling: 4,
          value: synthParams.oscFrequencyLFO.amount,
          onChange: (amount: number) => {
            let synthParams: SynthParams;
            updateSynthParams((prev) => {
              synthParams = {
                ...prev,
                oscFrequencyLFO: {
                  ...prev.oscFrequencyLFO,
                  amount,
                },
              };
              renderAudioGraph(synthParams);
              return synthParams;
            });
          },
        },
      },
    ],
    amp: undefined,
    delay: undefined,
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
  const renderAudioGraph = useRenderAudioGraph();

  const params = (() => {
    const xyPadParamMap = harmonySelected
      ? buildParamMap(
          harmonySynthParams,
          "harmony",
          setHarmonySynthParams,
          false,
        )
      : buildParamMap(melodySynthParams, "melody", setMelodySynthParams, true);
    return xyPadParamMap[selectedControls];
  })();

  const lfoParams = (() => {
    const lfoParamMap = harmonySelected
      ? buildLfoParamMap(
          harmonySynthParams,
          "harmony",
          setHarmonySynthParams,
          (params) => renderAudioGraph({ harmonySynthParams: params }),
        )
      : buildLfoParamMap(
          melodySynthParams,
          "melody",
          setMelodySynthParams,
          (params) => renderAudioGraph({ melodySynthParams: params }),
        );
    return lfoParamMap[selectedControls];
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
          "bg-secondary w-[316px] h-[316px] flex flex-col items-center justify-center rounded-b-xl rounded-br-xl rounded-tr-xl space-y-4",
          { "rounded-tl-xl": selectedControls !== "filter" },
        )}
      >
        <ParameterXYPad
          key={`${selectedControls}-${selectedInstrument}`}
          borderColor={borderColor}
          xParam={params.xParam}
          yParam={params.yParam}
          height={lfoParams ? 196 : 300}
        />
        {lfoParams && (
          <div className="flex flex-col w-[95%] items-center bg-primary-foreground p-2 rounded-xl">
            <div className="flex w-[90%]">
              <label className="px-12">rate</label>
              <label className="px-8">amount</label>
            </div>
            {lfoParams.map((lfo) => (
              <LFOControls
                key={`${selectedControls}-${selectedInstrument}-${lfo.label}`}
                label={lfo.label}
                className="w-[95%] rounded-xl"
                rate={lfo.rate}
                amount={lfo.amount}
                onRateChange={(rate) => {
                  lfo.rate.onChange(rate);
                }}
                onAmountChange={(amount) => {
                  lfo.amount.onChange(amount);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
