import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useAtom } from "jotai";
import { Dices } from "lucide-react";
import { selectedInstrumentAtom } from "state";
import { OscillatorShapeSelector, OscShape } from "./OscillatorShapeSelector";

export function InstrumentControls({
  instrument,
  oscShape,
  onOscShapeChange,
  onShuffleClicked,
}: {
  instrument: "harmony" | "melody";
  oscShape: OscShape;
  onOscShapeChange: (shape: OscShape) => void;
  onShuffleClicked: () => void;
}) {
  const [selectedInstrument, setSelectedInstrument] = useAtom(
    selectedInstrumentAtom,
  );
  const selected = selectedInstrument === instrument;
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-y-2 rounded-xl p-6",
        {
          "bg-primary-foreground": selected,
        },
      )}
      onClick={() => setSelectedInstrument(instrument)}
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
