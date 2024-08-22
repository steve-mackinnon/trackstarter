import { setProperty } from "audio/audioGraph";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

export function Filter(props: { x: number; y: number; nodeId: string }) {
  const [frequency, setFrequency] = useState(1000);
  const [type, setType] = useState<BiquadFilterType>("lowpass");
  const [q, setQ] = useState(0.707);

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
        default={1000}
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
        default={0.707}
        handleValueChange={(v) => setProperty(props.nodeId, "filter", "q", v)}
      />
    </DraggableContainer>
  );
}
