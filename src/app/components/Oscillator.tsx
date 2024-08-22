import { OscProps, setProperty } from "audio/audioGraph";
import { AudioParamSlider } from "common/components/AudioParamSlider";
import { ComboBox } from "common/components/ComboBox";
import { DraggableContainer } from "common/components/DraggableContainer";

export function Oscillator(props: {
  x: number;
  y: number;
  nodeId: string;
  props: OscProps;
}) {
  return (
    <DraggableContainer {...props} label="Oscillator" hasConnectionPort={true}>
      <AudioParamSlider
        label="Frequency"
        id="frequency"
        min={20}
        max={20000}
        default={props.props.frequency}
        scaling={3}
        handleValueChange={(v) =>
          setProperty(props.nodeId, "osc", "frequency", v)
        }
      />
      <ComboBox
        label="Shape"
        choices={["sine", "sawtooth", "square", "triangle"]}
        defaultValue="sawtooth"
        onChange={(v) => setProperty(props.nodeId, "osc", "type", v)}
      />
    </DraggableContainer>
  );
}
