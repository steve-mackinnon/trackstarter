import { Slider } from "common/components/ui/slider";
import { cn } from "common/utils";
import { useState } from "react";

interface LFOControlsProps {
  rate: number;
  amount: number;
  minRate: number;
  maxRate: number;
  minAmount: number;
  maxAmount: number;
  onRateChange: (value: number) => void;
  onAmountChange: (value: number) => void;
  className?: string;
  label: string;
}

export function LFOControls({
  rate,
  amount,
  minRate,
  maxRate,
  minAmount,
  maxAmount,
  onRateChange,
  onAmountChange,
  className,
  label,
}: LFOControlsProps) {
  const [rateValue, setRateValue] = useState(rate);
  const [amountValue, setAmountValue] = useState(amount);

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex space-x-4 w-full">
        <label className="min-w-10">{label}</label>
        <Slider
          id="lfo-rate"
          min={minRate}
          max={maxRate}
          step={0.1}
          value={[rateValue]}
          onValueChange={(values) => {
            setRateValue(values[0]);
            onRateChange(values[0]);
          }}
          className="w-full"
        />
        <Slider
          id="lfo-amount"
          min={minAmount}
          max={maxAmount}
          step={0.01}
          value={[amountValue]}
          onValueChange={(values) => {
            setAmountValue(values[0]);
            onAmountChange(values[0]);
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
