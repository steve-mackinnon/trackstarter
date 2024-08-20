import { OscProps } from "audio/audioGraph";
import { DraggableContainer } from "common/components/DraggableContainer";
import { useSetAtom } from "jotai";
import { updateNodeStateAtom } from "state";

export function Oscillator(props: {
  x: number;
  y: number;
  nodeId: string;
  props: OscProps;
}) {
  const updateNodeState = useSetAtom(updateNodeStateAtom);

  return (
    <DraggableContainer {...props} label="Oscillator" hasConnectionPort={true}>
      <label htmlFor="frequencySlider" className="select-none">
        Frequency
      </label>
      <input
        id="frequencySlider"
        type="range"
        value={props.props.frequency}
        min={20}
        max={1000}
        onChange={(e) =>
          updateNodeState({
            key: props.nodeId,
            props: {
              ...props.props,
              frequency: Number.parseFloat(e.target.value),
            },
          })
        }
        onMouseDown={(e) => {
          // Prevents drag from starting
          e.stopPropagation();
        }}
      />
      <label htmlFor="shape" className="select-none">
        Shape
      </label>
      <select
        className="text-black"
        name="shape"
        id="shape"
        onChange={(e) => {
          updateNodeState({
            key: props.nodeId,
            props: {
              ...props.props,
              type: e.target.value as OscillatorType,
            },
          });
        }}
        value={props.props.type}
      >
        <option value="sine">Sine</option>
        <option value="sawtooth">Saw</option>
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
      </select>
    </DraggableContainer>
  );
}
