import { Slider } from "common/components/ui/slider";
import { cn } from "common/utils";

interface LFOControlsProps {
  rate: number;
  amount: number;
  onRateChange: (value: number) => void;
  onAmountChange: (value: number) => void;
  className?: string;
}

export function LFOControls({
  rate,
  amount,
  onRateChange,
  onAmountChange,
  className,
}: LFOControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full bg-primary-foreground p-4",
        className,
      )}
    >
      <div className="flex flex-row space-x-4 w-full">
        <div className="flex-1 w-1/2 space-y-4 text-center">
          <label htmlFor="lfo-rate" className="block text-xs font-xs mb-1">
            Mod Rate
          </label>
          <Slider
            id="lfo-rate"
            min={0.1}
            max={10}
            step={0.1}
            // value={[rate]}
            onValueChange={(values) => onRateChange(values[0])}
            className="w-full"
          />
        </div>
        <div className="flex-1 w-1/2 space-y-4 text-center">
          <label htmlFor="lfo-amount" className="block text-xs font-xs mb-1">
            Mod Amount
          </label>
          <Slider
            id="lfo-amount"
            min={0}
            max={1}
            step={0.01}
            // value={[amount]}
            onValueChange={(values) => onAmountChange(values[0])}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
