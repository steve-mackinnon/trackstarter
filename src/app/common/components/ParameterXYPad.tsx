import {
  inverseScaleAndNormalizeValue,
  scaleNormalizedValue,
} from "common/utils/parameterScaling";
import { XYPad } from "./XYPad";

interface ParamInfo {
  min: number;
  max: number;
  scaling: number;
  value: number;
  onChange: (value: number) => void;
}

interface ParameterXYPadProps {
  xParam: ParamInfo;
  yParam: ParamInfo;
  width?: number;
  height?: number;
  borderColor: string;
}

export function ParameterXYPad({
  xParam,
  yParam,
  width,
  height,
  borderColor,
}: ParameterXYPadProps) {
  return (
    <XYPad
      width={width}
      height={height}
      borderColor={borderColor}
      x={inverseScaleAndNormalizeValue({
        value: xParam.value,
        min: xParam.min,
        max: xParam.max,
        scaling: xParam.scaling,
      })}
      y={inverseScaleAndNormalizeValue({
        value: 1 - yParam.value,
        min: yParam.min,
        max: yParam.max,
        scaling: yParam.scaling,
      })}
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
