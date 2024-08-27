import { setProperty } from "audio/audioGraph";
import {
  generateChordProgression,
  getRandomMood,
  getRandomNote,
  Mood,
  MOODS,
} from "audio/sequenceGenerator";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { ComboBox } from "common/components/ComboBox";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtom, useSetAtom } from "jotai";
import { Dices } from "lucide-react";
import { useState } from "react";
import {
  chordProgressionAtom,
  harmonySynthParamsAtom,
  isPlayingAtom,
} from "state";

export function ChordProgressionControls() {
  const [params, setParams] = useAtom(harmonySynthParamsAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const [mood, setMood] = useState<Mood | null>(null);
  const setChordProgression = useSetAtom(chordProgressionAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const [filterFreq, setFilterFreq] = useState(2000);

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
  };

  return (
    <div className="flex items-center">
      <button
        className="flex bg-emerald-700 h-10 w-10 justify-center items-center rounded-3xl hover:bg-emerald-600 active:bg-emerald-500"
        onClick={() => generateNewChordProgression(mood)}
      >
        <Dices />
      </button>

      <div className="w-64 space-y-2">
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
            setProperty("0", "osc", "type", v);
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
        <AudioParamSlider
          label="Tone"
          min={50}
          max={20000}
          scaling={3}
          default={filterFreq}
          id="filter-freq"
          handleValueChange={(freq) => {
            setFilterFreq(freq);
            setProperty("chord-prog-filter", "filter", "frequency", freq);
          }}
        />
      </div>
    </div>
  );
}
