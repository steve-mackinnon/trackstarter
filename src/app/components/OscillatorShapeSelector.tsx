import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useState } from "react";

export type OscShape = "sine" | "square" | "sawtooth" | "triangle";

export function OscillatorShapeSelector({
  oscShape,
  onChange,
}: {
  oscShape: OscShape;
  onChange: (shape: OscShape) => void;
}) {
  const [shape, setShape] = useState<OscShape>(oscShape);
  const className = (s: OscShape) =>
    cn("w-2 text-xs", { "bg-secondary": s === shape });

  const updateShape = (shape: OscShape) => {
    setShape(shape);
    onChange(shape);
  };

  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button
          className={className("sine")}
          variant="ghost"
          onClick={() => updateShape("sine")}
        >
          Sine
        </Button>
        <Button
          className={className("square")}
          variant="ghost"
          onClick={() => updateShape("square")}
        >
          Sqr
        </Button>
        <Button
          className={className("sawtooth")}
          variant="ghost"
          onClick={() => updateShape("sawtooth")}
        >
          Saw
        </Button>
        <Button
          className={className("triangle")}
          variant="ghost"
          onClick={() => updateShape("triangle")}
        >
          Tri
        </Button>
      </div>
    </div>
  );
}
