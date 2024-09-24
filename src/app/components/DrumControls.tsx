import { Button } from "common/components/ui/button";
import { Toggle } from "common/components/ui/toggle";
import { useGenerateNewDrumPattern } from "common/hooks/useGenerateNewDrumPattern";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom } from "jotai";
import { Dices, Volume2, VolumeXIcon } from "lucide-react";
import { useState } from "react";
import LoadingIndicator from "react-spinners/PuffLoader";
import { drumsAtom } from "state";

export function DrumControls() {
  const generateNewDrumPattern = useGenerateNewDrumPattern();
  const [isLoading, setIsLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [drumState, setDrumState] = useAtom(drumsAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return (
    <div className="flex flex-col relative justify-center items-center bg-primary-foreground p-4 rounded-xl border-2 border-fuchsia-800 space-y-2">
      <span className="font-bold text-lg">drums</span>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="gap-x-4 rounded-full active:bg-slate-500 border-slate-400"
          onClick={async () => {
            setIsLoading(true);
            await generateNewDrumPattern();
            setIsLoading(false);
          }}
        >
          <Dices />
        </Button>
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
      {isLoading && (
        <div className="absolute flex flex-col justify-center items-center w-full h-full bg-black opacity-85 rounded-xl">
          <LoadingIndicator color="white" />
        </div>
      )}
    </div>
  );
}
