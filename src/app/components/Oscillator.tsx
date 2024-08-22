import { OscProps, setProperty } from "audio/audioGraph";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

export function Oscillator(props: {
  x: number;
  y: number;
  nodeId: string;
  props: OscProps;
}) {
  const [frequency, setFrequency] = useState(props.props.frequency);
  const [type, setType] = useState(props.props.type);

  return (
    <DraggableContainer {...props} label="Oscillator" hasConnectionPort={true}>
      <AudioParamSlider
        label="Frequency"
        id="frequency"
        min={20}
        max={20000}
        default={props.props.frequency}
        scaling={3}
        handleValueChange={(v) =>
          setProperty(props.nodeId, "osc", "frequency", v)
        }
      />
      <label htmlFor="shape" className="select-none">
        Shape
      </label>
      <select
        className="text-black"
        name="shape"
        id="shape"
        onChange={(e) => {
          const type = e.target.value as OscillatorType;
          setType(type);
          setProperty(props.nodeId, "osc", "type", type);
        }}
        value={type}
      >
        <option value="sine">Sine</option>
        <option value="sawtooth">Saw</option>
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
      </select>
    </DraggableContainer>
  );
}
