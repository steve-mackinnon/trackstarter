import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useEffect, useState } from "react";

export type OscShape = "sine" | "square" | "sawtooth" | "triangle";

export function OscillatorShapeSelector({
  oscShape,
  onChange,
  disabled,
}: {
  oscShape: OscShape;
  onChange: (shape: OscShape) => void;
  disabled?: boolean;
}) {
  const [shape, setShape] = useState<OscShape>(oscShape);
  useEffect(() => {
    setShape(oscShape);
  }, [oscShape]);

  const className = (s: OscShape) =>
    cn("w-2 text-xs h-6 w-9", {
      "bg-secondary": s === shape,
      "border-[1px] border-slate-400": s === shape,
    });

  const updateShape = (shape: OscShape) => {
    setShape(shape);
    onChange(shape);
  };

  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button
          disabled={disabled}
          className={className("sine")}
          variant="ghost"
          onClick={() => updateShape("sine")}
        >
          sine
        </Button>
        <Button
          disabled={disabled}
          className={className("square")}
          variant="ghost"
          onClick={() => updateShape("square")}
        >
          sqr
        </Button>
        <Button
          disabled={disabled}
          className={className("sawtooth")}
          variant="ghost"
          onClick={() => updateShape("sawtooth")}
        >
          saw
        </Button>
        <Button
          disabled={disabled}
          className={className("triangle")}
          variant="ghost"
          onClick={() => updateShape("triangle")}
        >
          tri
        </Button>
      </div>
    </div>
  );
}
