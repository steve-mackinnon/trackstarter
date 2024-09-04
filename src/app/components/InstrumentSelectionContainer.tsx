import { useGenerateNewChordProgression } from "common/hooks/useGenerateNewChordProgression";
import { useGenerateNewMelody } from "common/hooks/useGenerateNewMelody";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom, useAtomValue } from "jotai";
import { harmonySynthParamsAtom, melodySynthParamsAtom, moodAtom } from "state";
import { InstrumentControls } from "./InstrumentControls";

export function InstrumentSelectionContainer() {
  const [harmonyParams, setHarmonyParams] = useAtom(harmonySynthParamsAtom);
  const [melodyParams, setMelodyParams] = useAtom(melodySynthParamsAtom);
  const generateNewChordProgression = useGenerateNewChordProgression();
  const generateNewMelody = useGenerateNewMelody();
  const mood = useAtomValue(moodAtom);
  const renderAudioGraph = useRenderAudioGraph();

  return (
    <div className="flex justify-between">
      <InstrumentControls
        instrument="harmony"
        onOscShapeChange={(shape) => {
          const newParams = { ...harmonyParams, type: shape };
          setHarmonyParams(newParams);
          renderAudioGraph({ harmonySynthParams: newParams });
        }}
        onShuffleClicked={() => generateNewChordProgression(mood)}
      />
      <InstrumentControls
        instrument="melody"
        onOscShapeChange={(shape) => {
          const newParams = { ...melodyParams, type: shape };
          setMelodyParams(newParams);
          renderAudioGraph({ melodySynthParams: newParams });
        }}
        onShuffleClicked={() => generateNewMelody()}
      />
    </div>
  );
}
