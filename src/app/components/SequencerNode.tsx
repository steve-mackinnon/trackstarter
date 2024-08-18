import { DraggableContainer } from "common/components/DraggableContainer";

export function SequencerNode(props: { x: number; y: number; nodeId: string }) {
  return (
    <DraggableContainer {...props} label="Sequencer" hasConnectionPort={true} />
  );
}
