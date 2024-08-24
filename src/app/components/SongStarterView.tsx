"use client";

import { render, SequencerProps, start } from "audio/audioGraph";
import { defaultSequencerProps, osc, output, sequencer } from "audio/nodes";
import {
  chordProgressionToSequencerEvents,
  generateChordProgression,
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
          const chords = generateChordProgression("Dark");
          const sequence = chordProgressionToSequencerEvents(chords);
          const sequencerProps: SequencerProps = {
            ...defaultSequencerProps(),
            destinationNodes: ["0"],
            notes: sequence,
            length: 128,
          };
          render(
            output(undefined, [
              sequencer(sequencerProps),
              osc({ type: "sine", detune: 0 }, [], "0"),
            ])
          );
          start();
        }}
      >
        Randomize Chord Progression
      </button>
    </div>
  );
}
