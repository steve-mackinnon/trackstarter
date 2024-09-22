import { Slider } from "common/components/ui/slider";
import { cn } from "common/utils";
import {
  inverseScaleAndNormalizeValue,
  scaleNormalizedValue,
} from "common/utils/parameterScaling";
import { useState } from "react";

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
}

export function LFOControls({
  rate,
  amount,
  onRateChange,
  onAmountChange,
  className,
  label,
}: LFOControlsProps) {
  const [rateValue, setRateValue] = useState(
    inverseScaleAndNormalizeValue({
      value: rate.value,
      min: rate.min,
      max: rate.max,
      scaling: rate.scaling,
    }),
  );
  const [amountValue, setAmountValue] = useState(
    inverseScaleAndNormalizeValue({
      value: amount.value,
      min: amount.min,
      max: amount.max,
      scaling: amount.scaling,
    }),
  );

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex space-x-4 w-full">
        <label className="min-w-10">{label}</label>
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
        />
      </div>
    </div>
  );
}
