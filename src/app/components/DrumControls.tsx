import { ComboBox } from "common/components/ComboBox";
import { Button } from "common/components/ui/button";
import { Toggle } from "common/components/ui/toggle";
import { useGenerateNewDrumPattern } from "common/hooks/useGenerateNewDrumPattern";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom } from "jotai";
import { Dices, Thermometer, Volume2, VolumeXIcon } from "lucide-react";
import { useState } from "react";
import LoadingIndicator from "react-spinners/PuffLoader";
import { drumsAtom, drumsLoadingAtom } from "state";

export function DrumControls() {
  const generateNewDrumPattern = useGenerateNewDrumPattern();
  const [muted, setMuted] = useState(false);
  const [drumState, setDrumState] = useAtom(drumsAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const [drumsLoading, setDrumsLoading] = useAtom(drumsLoadingAtom);

  return (
    <div className="flex flex-col relative justify-center items-center bg-primary-foreground p-4 rounded-xl border-2 border-fuchsia-800 space-y-2">
      <span className="font-bold text-lg">drums</span>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="gap-x-4 rounded-full active:bg-slate-500 border-slate-400"
          onClick={async () => {
            setDrumsLoading(true);
            await generateNewDrumPattern(drumState.patternGenIntensity);
            setDrumsLoading(false);
          }}
        >
          <Dices />
        </Button>
        <div className="flex items-center">
          <Thermometer />
          <ComboBox
            widthPx={110}
            choices={["low", "medium", "high"]}
            defaultValue={drumState.patternGenIntensity}
            onChange={async (value: "low" | "medium" | "high") => {
              setDrumState({ ...drumState, patternGenIntensity: value });
              setDrumsLoading(true);
              await generateNewDrumPattern(value);
              setDrumsLoading(false);
            }}
          />
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
