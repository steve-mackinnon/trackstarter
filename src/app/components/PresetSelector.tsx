import { Button } from "common/components/ui/button";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useSetAtom } from "jotai";
import { Preset, PRESETS } from "presets";
import { harmonySynthParamsAtom, melodySynthParamsAtom } from "state";

export function PresetSelector() {
  const setHarmony = useSetAtom(harmonySynthParamsAtom);
  const setMelody = useSetAtom(melodySynthParamsAtom);
  const renderAudioGraph = useRenderAudioGraph();

  const loadPreset = (preset: Preset) => {
    setHarmony(preset.harmony);
    setMelody(preset.melody);
    renderAudioGraph({
      harmonySynthParams: preset.harmony,
      melodySynthParams: preset.melody,
    });
  };

  return (
    <div className="flex gap-x-2">
      <Button
        className="w-8 h-8"
        variant="outline"
        onClick={() => loadPreset(PRESETS[0])}
      >
        A
      </Button>
      <Button
        className="w-8 h-8"
        variant="outline"
        onClick={() => loadPreset(PRESETS[1])}
      >
        B
      </Button>
      <Button
        className="w-8 h-8"
        variant="outline"
        onClick={() => loadPreset(PRESETS[2])}
      >
        C
      </Button>
      <Button
        className="w-8 h-8"
        variant="outline"
        onClick={() => loadPreset(PRESETS[3])}
      >
        D
      </Button>
    </div>
  );
}
