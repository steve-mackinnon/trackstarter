import { Button } from "common/components/ui/button";
import { Toggle } from "common/components/ui/toggle";
import { useGenerateNewDrumPattern } from "common/hooks/useGenerateNewDrumPattern";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom } from "jotai";
import { Volume2, VolumeXIcon } from "lucide-react";
import { useState } from "react";
import LoadingIndicator from "react-spinners/PuffLoader";
import { drumsAtom, drumsLoadingAtom } from "state";

export function DrumControls() {
  const generateNewDrumPattern = useGenerateNewDrumPattern();
  const [muted, setMuted] = useState(false);
  const [drumState, setDrumState] = useAtom(drumsAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const [drumsLoading, setDrumsLoading] = useAtom(drumsLoadingAtom);

  const randomizePattern = async (temp: "low" | "medium" | "high") => {
    setDrumsLoading(true);
    await generateNewDrumPattern(temp);
    setDrumsLoading(false);
  };
  return (
    <div className="flex flex-col relative justify-center items-center bg-primary-foreground p-2 rounded-xl border-2 border-fuchsia-800 space-y-2">
      <div>
        <span className="font-bold text-lg">drums</span>
      </div>
      <div className="flex space-x-2">
        <div className="flex flex-col justify-center items-center space-y-1">
          <div className="flex items-center space-x-1">
            <Button
              className="rounded-full"
              variant="outline"
              onClick={() => randomizePattern("low")}
              aria-label="generate low intensity drum pattern"
            >
              lo
            </Button>
            <Button
              className="rounded-full"
              variant="outline"
              onClick={() => randomizePattern("medium")}
              aria-label="generate medium intensity drum pattern"
            >
              md
            </Button>
            <Button
              className="rounded-full"
              variant="outline"
              onClick={() => randomizePattern("high")}
              aria-label="generate high intensity drum pattern"
            >
              hi
            </Button>
          </div>
          <span className="text-xs text-slate-300">randomize pattern</span>
        </div>
        <Toggle
          aria-label={`mute drums`}
          onClick={() => {
            setMuted(!muted);
            const drums = { ...drumState, muted: !muted };
            setDrumState(drums);
            renderAudioGraph({ drums });
          }}
        >
          {!muted && <Volume2 />}
          {muted && <VolumeXIcon />}
        </Toggle>
      </div>
      {drumsLoading && (
        <div className="absolute flex flex-col justify-center items-center w-full h-full bg-black opacity-85 rounded-xl">
          <LoadingIndicator color="white" />
        </div>
      )}
    </div>
  );
}
