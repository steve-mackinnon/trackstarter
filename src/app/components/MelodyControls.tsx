"use client";

import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { Button } from "common/components/ui/button";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtomValue } from "jotai";
import { Music, RefreshCw } from "lucide-react";
import { chordProgressionAtom } from "state";

export function MelodyControls() {
  const chordProgression = useAtomValue(chordProgressionAtom);
  const renderAudioGraph = useRenderAudioGraph();
  return (
    <div>
      <Button
        variant="default"
        className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500 text-white rounded-xl"
        disabled={chordProgression === null}
        aria-label="Generate new melody"
        onClick={async () => {
          if (!chordProgression) {
            return;
          }
          const melody = await generateMelodyForChordProgression(
            chordProgression.chordNames,
          );
          renderAudioGraph({ melody });
        }}
      >
        <RefreshCw />
        <Music />
      </Button>
    </div>
  );
}
