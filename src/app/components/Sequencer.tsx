"use client";

import { ChangeEvent, useState } from "react";
import { render as renderAudioGraph } from "../audio/audioGraph";
import { filter, osc, output, sequencer } from "../audio/nodes";

const audioGraph = (frequency: number, type: "lowpass" | "highpass") =>
  output({}, [
    sequencer({ rate: "8n", transposition: 0, destinationNodes: ["sineosc"] }),
    filter({ type, frequency, q: 1.7 }, [
      osc({ type: "sine", frequency: 100 }, [], "sineosc"),
      osc({ type: "square", frequency: 300 }),
    ]),
  ]);

export function Sequencer() {
  const [filterFreq, setFilterFreq] = useState(1000);
  const [filter, setFilter] = useState<"lowpass" | "highpass">("lowpass");

  return (
    <>
      <input
        type="range"
        min={20}
        max={20000}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const freq = Number.parseFloat(e.target.value);
          setFilterFreq(freq);
          renderAudioGraph(audioGraph(freq, filter));
        }}
        width={300}
      />
      <button
        onClick={() => {
          setFilter("lowpass");
          renderAudioGraph(audioGraph(filterFreq, "lowpass"));
        }}
      >
        Lowpass
      </button>
      <button
        onClick={() => {
          setFilter("highpass");
          renderAudioGraph(audioGraph(filterFreq, "highpass"));
        }}
      >
        Highpass
      </button>
    </>
  );
}
