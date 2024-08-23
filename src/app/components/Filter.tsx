import { FilterProps, setProperty } from "audio/audioGraph";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

export function Filter(props: {
  x: number;
  y: number;
  nodeId: string;
  props: FilterProps;
}) {
  const [type, setType] = useState<BiquadFilterType>("lowpass");

  return (
    <DraggableContainer {...props} label="Filter" hasConnectionPort={true}>
      <label htmlFor="type" className="select-none">
        Type
      </label>
      <select
        className="text-black"
        name="type"
        id="type"
        onChange={(e) => {
          const val = e.target.value as BiquadFilterType;
          setType(val);
          setProperty(props.nodeId, "filter", "type", val);
        }}
        value={type}
      >
        <option value="lowpass">Lowpass</option>
        <option value="highpass">Highpass</option>
      </select>
      <AudioParamSlider
        label="Frequency"
        id="frequency"
        min={20}
        max={20000}
        default={props.props.frequency}
        scaling={2}
        handleValueChange={(v) =>
          setProperty(props.nodeId, "filter", "frequency", v)
        }
      />
      <AudioParamSlider
        label="Q"
        id="q"
        min={0.1}
        max={12}
        scaling={2}
        default={props.props.q}
        handleValueChange={(v) => setProperty(props.nodeId, "filter", "q", v)}
      />
    </DraggableContainer>
  );
}
