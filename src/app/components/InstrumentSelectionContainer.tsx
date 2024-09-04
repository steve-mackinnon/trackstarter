import { useGenerateNewChordProgression } from "common/hooks/useGenerateNewChordProgression";
import { useGenerateNewMelody } from "common/hooks/useGenerateNewMelody";
import { useAtom, useAtomValue } from "jotai";
import { harmonySynthParamsAtom, melodySynthParamsAtom, moodAtom } from "state";
import { InstrumentControls } from "./InstrumentControls";

export function InstrumentSelectionContainer() {
  const [harmonyParams, setHarmonyParams] = useAtom(harmonySynthParamsAtom);
  const [melodyParams, setMelodyParams] = useAtom(melodySynthParamsAtom);
  const generateNewChordProgression = useGenerateNewChordProgression();
  const generateNewMelody = useGenerateNewMelody();
  const mood = useAtomValue(moodAtom);

  return (
    <div className="flex justify-between">
      <InstrumentControls
        instrument="harmony"
        onOscShapeChange={(shape) => {
          setHarmonyParams({ ...harmonyParams, type: shape });
        }}
        onShuffleClicked={() => generateNewChordProgression(mood)}
      />
      <InstrumentControls
        instrument="melody"
        onOscShapeChange={(shape) => {
          setMelodyParams({ ...melodyParams, type: shape });
        }}
        onShuffleClicked={() => generateNewMelody()}
      />
    </div>
  );
}
