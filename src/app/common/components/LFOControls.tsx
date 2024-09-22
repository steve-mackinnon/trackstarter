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
}: LFOControlsProps) {
  const [rateValue, setRateValue] = useState(rate);
  const [amountValue, setAmountValue] = useState(amount);

  return (
    <div
      className={cn(
        "flex flex-col w-full bg-primary-foreground p-4",
        className,
      )}
    >
      <div className="flex flex-row space-x-4 w-full">
        <div className="flex-1 w-1/2 space-y-4 text-center">
          <label htmlFor="lfo-rate" className="block text-sm font-sm mb-1">
            Mod Rate
          </label>
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
        </div>
        <div className="flex-1 space-y-4 text-center">
          <label htmlFor="lfo-amount" className="block text-sm font-sm mb-1">
            Mod Amount
          </label>
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
    </div>
  );
}
