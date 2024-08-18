import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { cursorModeAtom } from "state";

export function useSetupHotkeys() {
  const setCursorMode = useSetAtom(cursorModeAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": {
          setCursorMode("selection");
          break;
        }
        case "1": {
          setCursorMode("selection");
          break;
        }
        case "2": {
          setCursorMode("osc");
          break;
        }
        case "3": {
          setCursorMode("filter");
          break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
