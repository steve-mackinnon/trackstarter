import { setProperty } from "audio/audioGraph";
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
      <label htmlFor="frequencySlider" className="select-none">
        Frequency
      </label>
      <input
        id="frequencySlider"
        type="range"
        min={20}
        max={20000}
        value={frequency}
        onChange={(e) => {
          const freq = Number.parseFloat(e.target.value);
          setFrequency(freq);
          setProperty(props.nodeId, "filter", "frequency", freq);
        }}
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
        min={0.1}
        max={5}
        value={q}
        onChange={(e) => {
          const _q = Number.parseFloat(e.target.value);
          setQ(_q);
          setProperty(props.nodeId, "filter", "q", _q);
        }}
        onMouseDown={(e) => {
          // Prevents drag from starting
          e.stopPropagation();
        }}
      />
    </DraggableContainer>
  );
}
