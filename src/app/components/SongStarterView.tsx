"use client";

import * as AudioGraph from "audio/audioGraph";
import { defaultSequencerProps, osc, output, sequencer } from "audio/nodes";
import {
  ChordProgression,
  chordProgressionToSequencerEvents,
  generateChordProgression,
  getRandomMood,
  getRandomNote,
} from "audio/sequenceGenerator";
import { useSetupHotkeys } from "common/hooks/useSetupHotkeys";
import { useUpdateAudioGraphOnStateChange } from "common/hooks/useUpdateAudioGraphOnStateChange";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { isPlayingAtom } from "state";
import { TransportButton } from "./TransportButton";

export function SongStarterView() {
  useSetupHotkeys();
  useUpdateAudioGraphOnStateChange();
  const [chordProgression, setChordProgression] = useState<
    ChordProgression | undefined
  >();
  const setIsPlaying = useSetAtom(isPlayingAtom);

  return (
    <div className="bg-black absolute flex flex-col gap-y-1 w-full h-full justify-center items-center">
      <TransportButton className="absolute flex top-5 " />
      <button
        className="bg-slate-700 h-16 p-5 rounded-xl hover:bg-slate-600 active:bg-slate-500"
        onClick={() => {
          const chordProgression = generateChordProgression(
            getRandomNote(),
            getRandomMood(),
            4
          );
          setChordProgression(chordProgression);
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
          setIsPlaying(true);
        }}
      >
        Randomize Chord Progression
      </button>
      <b className="block">Mood: </b>
      {chordProgression?.mood}
      <b className="block">Root: </b>
      {chordProgression?.rootNote}
      <b className="block">Progression: </b>
      {chordProgression?.progression}
      <b className="block">Chords: </b>
      {chordProgression?.chordNames.map(
        (cn, i) =>
          `${cn}${i < chordProgression.chordNames.length - 1 ? "," : ""} `
      )}
    </div>
  );
}
