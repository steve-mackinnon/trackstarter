import { DraggableContainer } from "common/components/DraggableContainer";

export function DestinationNode(props: {
  x: number;
  y: number;
  nodeId: string;
  deletable: boolean;
}) {
  return (
    <DraggableContainer
      {...props}
      label="Output"
      hasConnectionPort={true}
    ></DraggableContainer>
  );
}
