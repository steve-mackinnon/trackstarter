import * as AudioGraph from "audio/audioGraph";
import { defaultSequencerProps, osc, output, sequencer } from "audio/nodes";
import { chordProgressionToSequencerEvents } from "audio/sequenceGenerator";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { chordProgressionAtom, harmonySynthParamsAtom } from "state";

export function useRenderAudioGraph() {
  const chordProgression = useAtomValue(chordProgressionAtom);
  const harmonySynthParams = useAtomValue(harmonySynthParamsAtom);

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
        osc(harmonySynthParams, [], "0"),
      ])
    );
    AudioGraph.stop();
    AudioGraph.start();
  }, [chordProgression]);
}
