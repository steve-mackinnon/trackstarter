import { ParameterXYPad } from "common/components/ParameterXYPad";
import { SynthParams } from "state";

export function FilterControlsContainer({
  params,
  onFreqChange,
  onQChange,
}: {
  params: SynthParams;
  onFreqChange: (value: number) => void;
  onQChange: (value: number) => void;
}) {
  return (
    <div>
      <ParameterXYPad
        xParam={{
          min: 50,
          max: 20000,
          scaling: 3,
          value: params.filterFrequency,
          onChange: onFreqChange,
        }}
        yParam={{
          min: 0.2,
          max: 20,
          scaling: 3,
          value: params.filterQ,
          onChange: onQChange,
        }}
      />
    </div>
  );
}
