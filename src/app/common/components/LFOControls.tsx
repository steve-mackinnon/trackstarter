import { Slider } from "common/components/ui/slider";
import { cn } from "common/utils";
import {
  inverseScaleAndNormalizeValue,
  scaleNormalizedValue,
} from "common/utils/parameterScaling";
import { useEffect, useState } from "react";

interface ParamInfo {
  value: number;
  min: number;
  max: number;
  scaling: number;
}

interface LFOControlsProps {
  rate: ParamInfo;
  amount: ParamInfo;
  onRateChange: (value: number) => void;
  onAmountChange: (value: number) => void;
  className?: string;
  label: string;
  rangeColor?: string;
}

export function LFOControls({
  rate,
  amount,
  onRateChange,
  onAmountChange,
  className,
  label,
  rangeColor,
}: LFOControlsProps) {
  const [rateValue, setRateValue] = useState(0);
  const [amountValue, setAmountValue] = useState(0);

  useEffect(() => {
    setRateValue(
      inverseScaleAndNormalizeValue({
        value: rate.value,
        min: rate.min,
        max: rate.max,
        scaling: rate.scaling,
      }),
    );
    setAmountValue(
      inverseScaleAndNormalizeValue({
        value: amount.value,
        min: amount.min,
        max: amount.max,
        scaling: amount.scaling,
      }),
    );
  }, [rate, amount]);
  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex space-x-4 w-full items-center">
        <label className="min-w-10 text-sm">{label}</label>
        <Slider
          id="lfo-rate"
          min={0}
          max={1}
          step={0.0001}
          value={[rateValue]}
          onValueChange={(values) => {
            setRateValue(values[0]);
            const mappedValue = scaleNormalizedValue({
              normalizedValue: values[0],
              min: rate.min,
              max: rate.max,
              scaling: rate.scaling,
            });
            onRateChange(mappedValue);
          }}
          className="w-full"
          rangeColor={rangeColor}
        />
        <Slider
          id="lfo-amount"
          min={0}
          max={1}
          step={0.0001}
          value={[amountValue]}
          onValueChange={(values) => {
            setAmountValue(values[0]);
            const mappedValue = scaleNormalizedValue({
              normalizedValue: values[0],
              min: amount.min,
              max: amount.max,
              scaling: amount.scaling,
            });
            onAmountChange(mappedValue);
          }}
          className="w-full"
          rangeColor={rangeColor}
        />
      </div>
    </div>
  );
}
