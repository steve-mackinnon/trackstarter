import { useState } from "react";

function scaleValue({
  current,
  min,
  max,
  scaling,
}: {
  current: number;
  min: number;
  max: number;
  scaling: number;
}) {
  const scaled = Math.pow(current, scaling);
  return min + scaled * (max - min);
}

function formatValue(value: number, maxValue: number): string {
  if (value >= 1000) {
    const v = value / 1000;
    const decimals = value >= 10000 ? 1 : 2;
    return `${v.toFixed(decimals)}k`;
  }
  return value.toFixed(maxValue < 100 ? 3 : 0);
}

interface SliderProps {
  handleValueChange: (value: number) => void;
  id: string;
  label: string;
  min: number;
  max: number;
  default: number;
  // 1 = Linear
  // > 1 = Exponential
  // < 1 = Logarithmic
  scaling: number;
}

export function AudioParamSlider(props: SliderProps) {
  // TODO: map real value to normalized
  const [normalizedValue, setNormalizedValue] = useState(0.2);
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
            current: v,
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
          {formatValue(value, props.max)}
        </output>
      </div>
    </div>
  );
}
