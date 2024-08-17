import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

export function Oscillator(props: { x: number; y: number }) {
  const [frequency, setFrequency] = useState(200);
  const [type, setType] = useState<OscillatorType>("sine");

  return (
    <DraggableContainer {...props} label="Oscillator">
      <label htmlFor="frequencySlider" className="select-none">
        Frequency
      </label>
      <input
        id="frequencySlider"
        type="range"
        value={frequency}
        onChange={(e) => setFrequency(Number.parseFloat(e.target.value))}
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
        onChange={(e) => setType(e.target.value as OscillatorType)}
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
