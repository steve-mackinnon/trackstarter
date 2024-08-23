import { useState } from "react";

function scaleValue({
  normalizedValue,
  min,
  max,
  scaling,
}: {
  normalizedValue: number;
  min: number;
  max: number;
  scaling: number;
}) {
  const scaled = Math.pow(normalizedValue, scaling);
  return min + scaled * (max - min);
}

function inverseScaleValue({
  value,
  min,
  max,
  scaling,
}: {
  value: number;
  min: number;
  max: number;
  scaling: number;
}) {
  const normalizedValue = (value - min) / (max - min);
  return Math.pow(normalizedValue, 1 / scaling);
}

function formatValue({
  value,
  maxValue,
  abbreviateLargeValues,
}: {
  value: number;
  maxValue: number;
  abbreviateLargeValues: boolean;
}): string {
  if (!abbreviateLargeValues || value < 1000) {
    return value.toFixed(maxValue < 100 ? 3 : 0);
  }
  const v = value / 1000;
  const decimals = value >= 10000 ? 1 : 2;
  return `${v.toFixed(decimals)}k`;
}

interface SliderProps {
  handleValueChange: (value: number) => void;
  id: string;
  label: string;
  min: number;
  max: number;
  default: number;
  /// 1 = Linear
  /// > 1 = Exponential
  /// < 1 = Logarithmic
  scaling: number;
  abbreviateLargeValues?: boolean;
}

export function AudioParamSlider(props: SliderProps) {
  const normalizedDefaultValue = inverseScaleValue({
    value: props.default,
    min: props.min,
    max: props.max,
    scaling: props.scaling,
  });
  const [normalizedValue, setNormalizedValue] = useState(
    normalizedDefaultValue
  );
  const [value, setValue] = useState(props.default);

  return (
    <div className="w-full px-5">
      <input
        id={props.id}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={normalizedValue}
        onChange={(e) => {
          const v = Number.parseFloat(e.target.value);
          const scaled = scaleValue({
            normalizedValue: v,
            min: props.min,
            max: props.max,
            scaling: props.scaling,
          });
          setValue(scaled);
          setNormalizedValue(v);
          props.handleValueChange(scaled);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full"
      />
      <div className="flex flex-row w-full justify-between">
        <label htmlFor={props.id} className="select-none">
          {props.label}
        </label>
        <output htmlFor={props.id} className="select-none">
          {formatValue({
            value,
            maxValue: props.max,
            abbreviateLargeValues: props.abbreviateLargeValues ?? true,
          })}
        </output>
      </div>
    </div>
  );
}
