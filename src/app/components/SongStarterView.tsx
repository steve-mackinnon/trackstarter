"use client";

import * as AudioGraph from "audio/audioGraph";
import { defaultSequencerProps, osc, output, sequencer } from "audio/nodes";
import {
  chordProgressionToSequencerEvents,
  generateChordProgression,
  getRandomMood,
  getRandomNote,
} from "audio/sequenceGenerator";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useUpdateAudioGraphOnStateChange } from "common/hooks/useUpdateAudioGraphOnStateChange";
import { TransportButton } from "./TransportButton";

export function SongStarterView() {
  useSetupHotkeys();
  useUpdateAudioGraphOnStateChange();

  return (
    <div className="bg-black absolute flex w-full h-full justify-center items-center">
      <TransportButton className="absolute flex top-5 " />
      <button
        className="bg-slate-700 h-16 p-5 rounded-xl hover:bg-slate-600 active:bg-slate-500"
        onClick={() => {
          const chords = generateChordProgression(
            getRandomNote(),
            getRandomMood(),
            4
          );
          const sequence = chordProgressionToSequencerEvents(chords);
          AudioGraph.render(
            output(undefined, [
              sequencer({
                ...defaultSequencerProps(),
                destinationNodes: ["0"],
                notes: sequence,
                length: 64,
              }),
              osc({ type: "sine", detune: 0 }, [], "0"),
            ])
          );
          AudioGraph.stop();
          AudioGraph.start();
        }}
      >
        Randomize Chord Progression
      </button>
    </div>
  );
}
