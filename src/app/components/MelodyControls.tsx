"use client";

import { generateMelodyForChordProgression } from "audio/melodyGenerator";
import { Button } from "common/components/ui/button";
import { useRenderAudioGraph } from "common/hooks/useRenderAudioGraph";
import { useAtomValue, useSetAtom } from "jotai";
import { Music, RefreshCw } from "lucide-react";
import { chordProgressionAtom, melodyAtom } from "state";

export function MelodyControls() {
  const chordProgression = useAtomValue(chordProgressionAtom);
  const renderAudioGraph = useRenderAudioGraph();
  const setMelody = useSetAtom(melodyAtom);

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
          setMelody(melody ?? null);
          renderAudioGraph({ melody });
        }}
      >
        <RefreshCw />
        <Music />
      </Button>
    </div>
  );
}
