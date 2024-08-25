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
    <div className="bg-black absolute flex w-full h-full">
      <TransportButton className="absolute flex left-1/2 top-5 " />
      <button
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
