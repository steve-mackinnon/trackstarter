import { useEffect, useState } from "react";

interface DragState {
  xOffset: number;
  yOffset: number;
}

export function Oscillator(props: { x: number; y: number; id: string }) {
  const [frequency, setFrequency] = useState(200);
  const [type, setType] = useState<OscillatorType>("sine");
  const [pos, setPos] = useState({ x: props.x, y: props.y });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    const mouseUp = (e: any) => {
      e.stopPropagation();
      setDragState(null);
    };
    window.addEventListener("mouseup", mouseUp);

    const mouseMove = (e: MouseEvent) => {
      if (dragState) {
        setPos({
          x: e.clientX - dragState.xOffset,
          y: e.clientY - dragState.yOffset,
        });
      }
    };
    window.addEventListener("mousemove", mouseMove);
    return () => {
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
    };
  }, [dragState, setDragState, setPos]);

  const getBorderColor = () => {
    if (dragState) {
      return "white";
    } else if (isMouseOver) {
      return "yellow";
    }
    return "transparent";
  };
  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: "200px",
        height: "160px",
        border: `2px solid ${getBorderColor()}`,
        boxSizing: "border-box",
        background: isMouseOver ? "darkturquoise" : "slategray",
      }}
      className={`absolute flex flex-col bg-gray-500 p-4 items-center rounded-2xl`}
      onMouseDown={(e) => {
        e.stopPropagation();
        setDragState({
          xOffset: e.clientX - pos.x,
          yOffset: e.clientY - pos.y,
        });
      }}
      onMouseUp={() => setDragState(null)}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <label className="pb-3 select-none font-bold">Oscillator</label>
      <label htmlFor="frequencySlider" className="select-none">
        Frequency
      </label>
      <input
        id="frequencySlider"
        type="range"
        value={frequency}
        onChange={(e) => setFrequency(Number.parseFloat(e.target.value))}
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
    </div>
  );
}
