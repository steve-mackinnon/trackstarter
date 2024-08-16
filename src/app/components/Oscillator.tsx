import { MouseEventHandler, useEffect, useState } from "react";

export function Oscillator(props: { xCenter: number; yCenter: number }) {
  const [frequency, setFrequency] = useState(200);
  const [type, setType] = useState<OscillatorType>("sine");
  const [centerPos, setCenterPos] = useState({
    x: props.xCenter,
    y: props.yCenter,
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseUp: MouseEventHandler = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
  };
  useEffect(() => {
    const mouseUp = (e: any) => {
      handleMouseUp(e);
    };
    window.addEventListener("mouseup", mouseUp);
    return () => {
      window.removeEventListener("mouseup", mouseUp);
    };
  }, []);

  const getBorderColor = () => {
    if (isDragging) {
      return "white";
    } else if (isMouseOver) {
      return "blue";
    }
    return "transparent";
  };
  return (
    <div
      style={{
        top: `${centerPos.y}px`,
        left: `${centerPos.x}px`,
        width: "200px",
        height: "160px",
        border: `2px solid ${getBorderColor()}`,
        boxSizing: "border-box",
        background: isMouseOver ? "silver" : "gray",
      }}
      className={`absolute flex flex-col bg-gray-500 p-4 items-center rounded-2xl`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - centerPos.x,
          y: e.clientY - centerPos.y,
        });
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          setCenterPos({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          });
        }
      }}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <label className="pb-3 select-none">Oscillator</label>
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
