import { scaleValue } from "common/utils/parameterScaling";
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
}

export function ParameterXYPad({
  xParam,
  yParam,
  width,
  height,
}: ParameterXYPadProps) {
  return (
    <XYPad
      width={width}
      height={height}
      onChange={({ x, y }) => {
        xParam.onChange(
          scaleValue({
            normalizedValue: x,
            min: xParam.min,
            max: xParam.max,
            scaling: xParam.scaling,
          }),
        );
        yParam.onChange(
          scaleValue({
            normalizedValue: y,
            min: yParam.min,
            max: yParam.max,
            scaling: yParam.scaling,
          }),
        );
      }}
    />
  );
}
