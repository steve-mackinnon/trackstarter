import { Note, SequencerProps, setProperty } from "audio/audioGraph";
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
          setRoot(v.toString() as Note);
        }}
      />
      <ComboBox
        defaultValue={octave.toString()}
        label="Octave"
        choices={OCTAVE_CHOICES}
        onChange={(v) => {
          setOctave(Number.parseInt(v));
        }}
      />
    </DraggableContainer>
  );
}
