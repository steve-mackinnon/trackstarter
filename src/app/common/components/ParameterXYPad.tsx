import {
  inverseScaleAndNormalizeValue,
  scaleNormalizedValue,
} from "common/utils/parameterScaling";
import { XYPad } from "./XYPad";

export interface ParamInfo {
  min: number;
  max: number;
  scaling: number;
  value: number;
  label: string;
  onChange: (value: number) => void;
}

interface ParameterXYPadProps {
  xParam: ParamInfo;
  yParam: ParamInfo;
  width?: number;
  height?: number;
  borderColor: string;
  xLabel: string;
  yLabel: string;
}

export function ParameterXYPad({
  xParam,
  yParam,
  width,
  height,
  borderColor,
  xLabel,
  yLabel,
}: ParameterXYPadProps) {
  return (
    <XYPad
      width={width}
      height={height}
      borderColor={borderColor}
      xLabel={xLabel}
      yLabel={yLabel}
      x={inverseScaleAndNormalizeValue({
        value: xParam.value,
        min: xParam.min,
        max: xParam.max,
        scaling: xParam.scaling,
      })}
      y={
        1 -
        inverseScaleAndNormalizeValue({
          value: yParam.value,
          min: yParam.min,
          max: yParam.max,
          scaling: yParam.scaling,
        })
      }
      onChange={({ x, y }) => {
        xParam.onChange(
          scaleNormalizedValue({
            normalizedValue: x,
            min: xParam.min,
            max: xParam.max,
            scaling: xParam.scaling,
          }),
        );
        yParam.onChange(
          scaleNormalizedValue({
            normalizedValue: 1 - y,
            min: yParam.min,
            max: yParam.max,
            scaling: yParam.scaling,
          }),
        );
      }}
    />
  );
}
