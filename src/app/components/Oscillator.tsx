import { OscProps, setProperty } from "audio/audioGraph";
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
      <label htmlFor="frequencySlider" className="select-none">
        Frequency
      </label>
      <input
        id="frequencySlider"
        type="range"
        value={frequency}
        min={20}
        max={1000}
        onChange={(e) => {
          const freq = Number.parseFloat(e.target.value);
          setFrequency(freq);
          setProperty(props.nodeId, "osc", "frequency", freq);
        }}
        onMouseDown={(e) => {
          // Prevents drag from starting
          e.stopPropagation();
        }}
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
        value={props.props.type}
      >
        <option value="sine">Sine</option>
        <option value="sawtooth">Saw</option>
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
      </select>
    </DraggableContainer>
  );
}
