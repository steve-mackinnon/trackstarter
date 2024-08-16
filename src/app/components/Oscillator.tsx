import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MouseEventHandler, useEffect, useState } from "react";
import { activeDragAtom, atomForNode, nodesAtom } from "../state";

export function Oscillator(props: { x: number; y: number; id: string }) {
  const [frequency, setFrequency] = useState(200);
  const [type, setType] = useState<OscillatorType>("sine");
  const [pos, setPos] = useState({ x: props.x, y: props.y });
  const [activeDrag, setActiveDrag] = useAtom(activeDragAtom);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseUp: MouseEventHandler = (e: any) => {
    e.stopPropagation();
    setActiveDrag(null);
  };
  useEffect(() => {
    const mouseUp = (e: any) => {
      e.stopPropagation();
      setActiveDrag(null);
    };
    window.addEventListener("mouseup", mouseUp);
    return () => {
      window.removeEventListener("mouseup", mouseUp);
    };
  }, [setActiveDrag]);

  const getBorderColor = () => {
    if (activeDrag?.id === props.id) {
      return "white";
    } else if (isMouseOver) {
      return "blue";
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
        background: isMouseOver ? "silver" : "gray",
      }}
      className={`absolute flex flex-col bg-gray-500 p-4 items-center rounded-2xl`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        e.stopPropagation();

        setActiveDrag({
          id: props.id,
          xOffset: e.clientX - pos.x,
          yOffset: e.clientY - pos.y,
        });
      }}
      onMouseMove={(e) => {
        if (activeDrag?.id === props.id) {
          setPos({
            x: e.clientX - activeDrag.xOffset,
            y: e.clientY - activeDrag.yOffset,
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
