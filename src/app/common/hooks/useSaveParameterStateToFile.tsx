import { useAtomValue } from "jotai";
import { harmonySynthParamsAtom, melodySynthParamsAtom } from "state";

export function useSaveParameterStateToFile() {
  const harmonyParams = useAtomValue(harmonySynthParamsAtom);
  const melodyParams = useAtomValue(melodySynthParamsAtom);

  return () => {
    const data = { harmony: harmonyParams, melody: melodyParams };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preset.json";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
}
