import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useAtom } from "jotai";
import { Dices } from "lucide-react";
import { useState } from "react";
import { selectedInstrumentAtom } from "state";
import { OscillatorShapeSelector, OscShape } from "./OscillatorShapeSelector";

export function InstrumentControls({
  instrument,
  oscShape,
  onOscShapeChange,
  onShuffleClicked,
  borderColorActive,
  borderColorInactive,
}: {
  instrument: "harmony" | "melody";
  oscShape: OscShape;
  onOscShapeChange: (shape: OscShape) => void;
  onShuffleClicked: () => void;
  borderColorActive: string;
  borderColorInactive: string;
}) {
  const [selectedInstrument, setSelectedInstrument] = useAtom(
    selectedInstrumentAtom,
  );
  const [mouseOver, setMouseOver] = useState(false);

  const selected = selectedInstrument === instrument;
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-y-2 rounded-xl p-6 border-2",
        {
          "bg-primary-foreground": selected,
        },
      )}
      style={{
        borderColor:
          selected || mouseOver ? borderColorActive : borderColorInactive,
      }}
      onClick={() => setSelectedInstrument(instrument)}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      <span>{instrument}</span>
      <OscillatorShapeSelector
        oscShape={oscShape}
        onChange={onOscShapeChange}
      />
      <Button
        variant="outline"
        className="rounded-full"
        onClick={onShuffleClicked}
      >
        <Dices />
      </Button>
    </div>
  );
}
