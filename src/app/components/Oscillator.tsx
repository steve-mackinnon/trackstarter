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
      <ComboBox
        label="Shape"
        choices={["sine", "sawtooth", "square", "triangle"]}
        defaultValue="sawtooth"
        onChange={(v) => setProperty(props.nodeId, "osc", "type", v)}
      />
      <AudioParamSlider
        label="Detune"
        id="detune"
        min={-1200}
        max={1200}
        default={props.props.detune}
        scaling={1}
        abbreviateLargeValues={false}
        handleValueChange={(v) => setProperty(props.nodeId, "osc", "detune", v)}
      />
    </DraggableContainer>
  );
}
