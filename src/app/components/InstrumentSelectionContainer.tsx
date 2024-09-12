import { useGenerateNewMelody } from "common/hooks/useGenerateNewMelody";
import { useGenerateNewSong } from "common/hooks/useGenerateNewSong";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom, useAtomValue } from "jotai";
import {
  chordProgressionLoadingAtom,
  harmonySynthParamsAtom,
  melodyLoadingAtom,
  melodySynthParamsAtom,
  moodAtom,
  selectedInstrumentAtom,
} from "state";
import { InstrumentControls } from "./InstrumentControls";
import { OscShape } from "./OscillatorShapeSelector";

export function InstrumentSelectionContainer() {
  const [harmonyParams, setHarmonyParams] = useAtom(harmonySynthParamsAtom);
  const [melodyParams, setMelodyParams] = useAtom(melodySynthParamsAtom);
  const generateNewSong = useGenerateNewSong();
  const generateNewMelody = useGenerateNewMelody();
  const mood = useAtomValue(moodAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const melodyIsLoading = useAtomValue(melodyLoadingAtom);
  const harmonyIsLoading = useAtomValue(chordProgressionLoadingAtom);
  const selectedInstrument = useAtomValue(selectedInstrumentAtom);

  return (
    <div className="flex justify-between space-x-4">
      <InstrumentControls
        instrument="harmony"
        oscShape={harmonyParams.type as OscShape}
        onOscShapeChange={(shape) => {
          const newParams = { ...harmonyParams, type: shape };
          setHarmonyParams(newParams);
          renderAudioGraph({ harmonySynthParams: newParams });
        }}
        onShuffleClicked={() => generateNewSong(mood)}
        borderColorActive={"var(--harmony-border-active)"}
        borderColorInactive={"var(--harmony-border-inactive)"}
        isLoading={harmonyIsLoading}
        glowColor={
          selectedInstrument === "harmony" ? "var(--harmony-glow)" : undefined
        }
        muted={harmonyParams.gain === 0}
        onMuteChange={(muted) => {
          const params = { ...harmonyParams, gain: muted ? 0 : 0.1 };
          setHarmonyParams(params);
          renderAudioGraph({ harmonySynthParams: params });
        }}
      />
      <InstrumentControls
        instrument="melody"
        oscShape={melodyParams.type as OscShape}
        onOscShapeChange={(shape) => {
          const newParams = { ...melodyParams, type: shape };
          setMelodyParams(newParams);
          renderAudioGraph({ melodySynthParams: newParams });
        }}
        onShuffleClicked={() => generateNewMelody({ restartPlayback: false })}
        borderColorActive="var(--melody-border-active)"
        borderColorInactive="var(--melody-border-inactive)"
        isLoading={melodyIsLoading}
        glowColor={
          selectedInstrument === "melody" ? "var(--melody-glow)" : undefined
        }
        muted={melodyParams.gain === 0}
        onMuteChange={(muted) => {
          const params = { ...melodyParams, gain: muted ? 0 : 0.25 };
          setMelodyParams(params);
          renderAudioGraph({ melodySynthParams: params });
        }}
      />
    </div>
  );
}
