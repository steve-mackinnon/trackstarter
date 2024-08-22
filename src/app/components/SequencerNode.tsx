import { SequencerProps, setProperty } from "audio/audioGraph";
import { ComboBox } from "common/components/ComboBox";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useState } from "react";

const MAX_STEPS = 32;
const STEP_CHOICES = Array.from({ length: MAX_STEPS }, (_, i) =>
  (i + 1).toString(),
);

function SequenceInfo({
  label,
  currentValue,
  onChange,
}: {
  label: string;
  currentValue: number;
  onChange: (val: number) => void;
}) {
  const [value, setValue] = useState(currentValue);

  return (
    <div className="flex w-full justify-between">
      <ComboBox
        label={label}
        choices={STEP_CHOICES}
        defaultValue={value.toString()}
        onChange={(v) => {
          const val = Number.parseInt(v);
          setValue(val);
          onChange(val);
        }}
      />
    </div>
  );
}
export function SequencerNode(props: {
  x: number;
  y: number;
  nodeId: string;
  props: SequencerProps;
}) {
  const [length, setLength] = useState(props.props.length);
  const [steps, setSteps] = useState(props.props.steps);

  return (
    <DraggableContainer
      {...props}
      label="Sequencer"
      hasConnectionPort={true}
      className={"gap-y-2"}
    >
      <SequenceInfo
        currentValue={length}
        label="Length"
        onChange={(v) => {
          setLength(v);
          setProperty(props.nodeId, "sequencer", "length", v);
        }}
      />
      <SequenceInfo
        currentValue={steps}
        label="Steps"
        onChange={(v) => {
          setSteps(v);
          setProperty(props.nodeId, "sequencer", "steps", v);
        }}
      />
    </DraggableContainer>
  );
}
