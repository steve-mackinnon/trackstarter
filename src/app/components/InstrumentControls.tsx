import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useAtom } from "jotai";
import { Dices } from "lucide-react";
import { useState } from "react";
import LoadingIndicator from "react-spinners/PuffLoader";
import { selectedInstrumentAtom } from "state";
import { OscillatorShapeSelector, OscShape } from "./OscillatorShapeSelector";

export function InstrumentControls({
  instrument,
  oscShape,
  onOscShapeChange,
  onShuffleClicked,
  borderColorActive,
  borderColorInactive,
  isLoading,
  glowColor,
}: {
  instrument: "harmony" | "melody";
  oscShape: OscShape;
  onOscShapeChange: (shape: OscShape) => void;
  onShuffleClicked: () => void;
  borderColorActive: string;
  borderColorInactive: string;
  isLoading: boolean;
  glowColor?: string;
}) {
  const [selectedInstrument, setSelectedInstrument] = useAtom(
    selectedInstrumentAtom,
  );
  const [mouseOver, setMouseOver] = useState(false);

  const selected = selectedInstrument === instrument;
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-y-2 rounded-xl p-2 border-2 select-none relative",
        {
          "bg-primary-foreground": selected,
        },
      )}
      style={{
        borderColor:
          selected || mouseOver ? borderColorActive : borderColorInactive,
        boxShadow: glowColor ? `0px 0px 10px 10px ${glowColor}` : undefined,
      }}
      onClick={() => setSelectedInstrument(instrument)}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      <span className="font-bold text-lg">{instrument}</span>
      <OscillatorShapeSelector
        oscShape={oscShape}
        onChange={onOscShapeChange}
        disabled={isLoading}
      />
      <Button
        variant="outline"
        className="rounded-full active:bg-slate-500 border-slate-400"
        onClick={onShuffleClicked}
        disabled={isLoading}
        aria-label={`shuffle ${instrument}`}
      >
        <Dices />
      </Button>
      {isLoading && (
        <div className="absolute flex flex-col justify-center items-center w-full h-full bg-black opacity-85 rounded-xl">
          <LoadingIndicator color="white" />
        </div>
      )}
    </div>
  );
}
