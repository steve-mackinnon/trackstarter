import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

export function Filter(props: { x: number; y: number }) {
  const [frequency, setFrequency] = useState(1000);
  const [type, setType] = useState<BiquadFilterType>("lowpass");
  const [q, setQ] = useState(0.707);

  return (
    <DraggableContainer {...props} label="Filter">
      <label htmlFor="type" className="select-none">
        Type
      </label>
      <select
        className="text-black"
        name="type"
        id="type"
        onChange={(e) => setType(e.target.value as BiquadFilterType)}
        value={type}
      >
        <option value="lowpass">Lowpass</option>
        <option value="highpass">Highpass</option>
      </select>
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
      <label htmlFor="q-slider" className="select-none">
        Q
      </label>
      <input
        id="q-slider"
        type="range"
        value={q}
        onChange={(e) => setQ(Number.parseFloat(e.target.value))}
        onMouseDown={(e) => {
          // Prevents drag from starting
          e.stopPropagation();
        }}
      />
    </DraggableContainer>
  );
}
