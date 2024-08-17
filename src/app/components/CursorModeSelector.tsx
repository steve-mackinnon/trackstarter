import { useAtom } from "jotai";
import { AudioWaveform, Filter, MousePointer2 } from "lucide-react";
import { PropsWithChildren } from "react";
import { CursorMode, cursorModeAtom } from "state";

function RadioButton({
  value,
  currentValue,
  handleClick,
  children,
}: PropsWithChildren<{
  value: string;
  currentValue: string;
  handleClick: (value: string) => void;
}>) {
  return (
    <label
      className={
        (value === currentValue ? "bg-slate-400 " : "") +
        "hover:bg-slate-300 w-8 h-8 flex items-center justify-center"
      }
    >
      <input
        type="radio"
        checked={value === currentValue}
        onClick={() => handleClick(value)}
        className="hidden"
      />
      {children}
    </label>
  );
}

export function CursorModeSelector({ className }: { className: string }) {
  const [cursorMode, setCursorMode] = useAtom(cursorModeAtom);

  return (
    <div className={className + " flex border-white border-2 p-1"}>
      <RadioButton
        value="selection"
        currentValue={cursorMode}
        handleClick={(value) => setCursorMode(value as CursorMode)}
      >
        <MousePointer2 />
      </RadioButton>
      <RadioButton
        value="osc"
        currentValue={cursorMode}
        handleClick={(value) => setCursorMode(value as CursorMode)}
      >
        <AudioWaveform />
      </RadioButton>
      <RadioButton
        value="filter"
        currentValue={cursorMode}
        handleClick={(value) => setCursorMode(value as CursorMode)}
      >
        <Filter />
      </RadioButton>
    </div>
  );
}
