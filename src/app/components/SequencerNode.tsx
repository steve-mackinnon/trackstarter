import { Note, SequencerProps, setProperty } from "audio/audioGraph";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { ComboBox } from "common/components/ComboBox";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

const MAX_STEPS = 32;
const STEP_CHOICES = Array.from({ length: MAX_STEPS }, (_, i) =>
  (i + 1).toString()
);

const NOTE_CHOICES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const OCTAVE_CHOICES = Array.from({ length: 6 }, (_, i) => i.toString());

export function SequencerNode(props: {
  x: number;
  y: number;
  nodeId: string;
  props: SequencerProps;
}) {
  const [length, setLength] = useState(props.props.length);
  const [steps, setSteps] = useState(props.props.steps);
  const [root, setRoot] = useState(props.props.rootNote);
  const [octave, setOctave] = useState(props.props.octave);
  const [probability, setProbability] = useState(props.props.probability * 100);

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
        defaultValue={root}
        label="Note"
        choices={NOTE_CHOICES}
        onChange={(v) => {
          const note = v.toString() as Note;
          setRoot(note);
          setProperty(props.nodeId, "sequencer", "rootNote", note);
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
    </DraggableContainer>
  );
}
