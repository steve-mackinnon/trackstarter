import { setProperty } from "audio/audioGraph";
import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import {
  generateChordProgression,
  getRandomMood,
  getRandomNote,
  Mood,
  MOODS,
} from "audio/sequenceGenerator";
import { ComboBox } from "common/components/ComboBox";
import { ParameterXYPad } from "common/components/ParameterXYPad";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom, useSetAtom } from "jotai";
import { Dices } from "lucide-react";
import { useState } from "react";
import {
  chordProgressionAtom,
  harmonySynthParamsAtom,
  isPlayingAtom,
  melodyAtom,
} from "state";

export function ChordProgressionControls() {
  const [params, setParams] = useAtom(harmonySynthParamsAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const [mood, setMood] = useState<Mood | null>(null);
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const setMelody = useSetAtom(melodyAtom);
  const renderAudioGraph = useRenderAudioGraph();

  const generateNewChordProgression = (mood: Mood | null) => {
    const chordProgression = generateChordProgression({
      rootNote: getRandomNote(),
      mood: mood ?? getRandomMood(),
      notesPerChord: 4,
      octave: 3,
    });
    setChordProgression(chordProgression);
    renderAudioGraph({ progression: chordProgression });
    setIsPlaying(true);

    generateMelodyForChordProgression(chordProgression.chordNames).then(
      (seq) => {
        setMelody(seq ?? null);
        renderAudioGraph({ progression: chordProgression, melody: seq });
      },
    );
  };

  return (
    <div className="flex">
      <button
        className="flex bg-emerald-700 mt-2 h-10 w-10 justify-center items-center rounded-3xl hover:bg-emerald-600 active:bg-emerald-500"
        onClick={() => generateNewChordProgression(mood)}
      >
        <Dices />
      </button>

      <div className="w-64">
        <ComboBox
          className="w-32"
          label="Osc"
          choices={["sine", "sawtooth", "square", "triangle"]}
          defaultValue={
            params.type as "sine" | "sawtooth" | "square" | "triangle"
          }
          onChange={(v) => {
            const p = { ...params, type: v };
            setParams(p);
            setProperty("harmony-osc", "osc", "type", v);
            renderAudioGraph({ harmonySynthParams: p });
          }}
        />
        <ComboBox
          className="w-32"
          label="Mood"
          choices={(MOODS as string[]).concat("Any")}
          onChange={(newMood: string | null) => {
            if (newMood === "Any") {
              newMood = null;
            }
            setMood(newMood as Mood | null);
            generateNewChordProgression(newMood as Mood | null);
          }}
          defaultValue="Any"
        />
        <ParameterXYPad
          xParam={{
            min: 50,
            max: 20000,
            scaling: 3,
            value: params.filterFrequency,
            onChange: (value) => {
              setParams({ ...params, filterFrequency: value });
              setProperty("chord-prog-filter", "filter", "frequency", value);
            },
          }}
          yParam={{
            min: 0.2,
            max: 20,
            scaling: 3,
            value: params.filterQ,
            onChange: (value) => {
              setParams({ ...params, filterQ: value });
              setProperty("chord-prog-filter", "filter", "q", value);
            },
          }}
        />
      </div>
    </div>
  );
}
