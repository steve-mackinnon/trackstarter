import { SequencerProps, setProperty } from "audio/audioGraph";
import { generateSequence, Mood } from "audio/sequenceGenerator";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { ComboBox } from "common/components/ComboBox";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

const MAX_STEPS = 32;
const STEP_CHOICES = Array.from({ length: MAX_STEPS }, (_, i) =>
  (i + 1).toString()
);

const OCTAVE_CHOICES = Array.from({ length: 6 }, (_, i) => i.toString());
const MOOD_CHOICES: Mood[] = [
  "Uplifting",
  "Dark",
  "Exotic",
  "Mysterious",
  "Dramatic",
  "Sophisticated",
  "Dreamy",
  "Groovy",
  "Surreal",
];

export function SequencerNode(props: {
  x: number;
  y: number;
  nodeId: string;
  props: SequencerProps;
}) {
  const [length, setLength] = useState(props.props.length);
  const [steps, setSteps] = useState(props.props.steps);
  const [octave, setOctave] = useState(props.props.octave);
  const [probability, setProbability] = useState(props.props.probability * 100);
  const [notes, setNotes] = useState(props.props.notes);
  const [mood, setMood] = useState<Mood>("Dark");

  const generateNewSequence = () => {
    const sequence = generateSequence(mood, 8, "C", octave);
    setNotes(sequence);
    setProperty(props.nodeId, "sequencer", "notes", sequence);
  };

  return (
    <DraggableContainer
      {...props}
      label="Sequencer"
      hasConnectionPort={true}
      className={"gap-y-2"}
    >
      <ComboBox
        defaultValue={length.toString()}
        label="Length"
        choices={STEP_CHOICES}
        onChange={(v) => {
          const val = Number.parseInt(v);
          setLength(val);
          setProperty(props.nodeId, "sequencer", "length", val);
        }}
      />
      <ComboBox
        defaultValue={steps.toString()}
        label="Steps"
        choices={STEP_CHOICES}
        onChange={(v) => {
          const val = Number.parseInt(v);
          setSteps(val);
          setProperty(props.nodeId, "sequencer", "steps", val);
        }}
      />
      <ComboBox
        defaultValue={octave.toString()}
        label="Octave"
        choices={OCTAVE_CHOICES}
        onChange={(v) => {
          const octave = Number.parseInt(v);
          setOctave(octave);
          setProperty(props.nodeId, "sequencer", "octave", octave);
        }}
      />
      <AudioParamSlider
        label="Chance"
        min={0}
        max={100}
        default={probability}
        scaling={1}
        id={props.nodeId}
        handleValueChange={(v) => {
          setProbability(v);
          setProperty(props.nodeId, "sequencer", "probability", v / 100);
        }}
      />
      <ComboBox
        label="Mood"
        defaultValue={mood}
        choices={MOOD_CHOICES}
        onChange={(v: Mood) => {
          setMood(v);
        }}
      />
      <button onClick={() => generateNewSequence()}>Randomize</button>
      <ol>
        {notes.map((note) => (
          <span>{note}</span>
        ))}
      </ol>
    </DraggableContainer>
  );
}
