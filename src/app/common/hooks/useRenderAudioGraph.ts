import * as AudioGraph from "audio/audioGraph";
import { defaultSequencerProps, osc, output, sequencer } from "audio/nodes";
import { chordProgressionToSequencerEvents } from "audio/sequenceGenerator";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { chordProgressionAtom } from "state";

export function useRenderAudioGraph() {
  const chordProgression = useAtomValue(chordProgressionAtom);

  useEffect(() => {
    if (!chordProgression) {
      return;
    }
    const sequence = chordProgressionToSequencerEvents(
      chordProgression.chordNotes
    );
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
  }, [chordProgression]);
}
