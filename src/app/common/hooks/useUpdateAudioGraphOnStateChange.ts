import { Node, render } from "audio/audioGraph";
import { output } from "audio/nodes";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { connectionsAtom, nodesAtom } from "state";

export function useUpdateAudioGraphOnStateChange() {
  const nodes = useAtomValue(nodesAtom);
  const connections = useAtomValue(connectionsAtom);

  useEffect(() => {
    const destNode = nodes.find((n) => n.type === "destination");
    if (!destNode) {
      throw new Error("Destination node unexpectedly missing");
    }

    const populateAudioGraph = (audioGraph: Node) => {
      const children = connections[audioGraph.key!];
      if (children) {
        if (audioGraph.type === "sequencer") {
          // Special case sequencer which doesn't follow the same children pattern
          // as other nodes.
          audioGraph.props.destinationNodes = [];
          for (const childId of children) {
            audioGraph.props.destinationNodes.push(childId);
          }
        } else {
          for (const childId of children) {
            const child = nodes.find((n) => n.key === childId);
            if (!child) {
              throw new Error(`Could not find child with ID ${childId}`);
            }
            audioGraph.children?.push(child);
            populateAudioGraph(child);
          }
        }
      }
    };
    const audioGraph = output(undefined, []);
    audioGraph.key = destNode.key;
    populateAudioGraph(audioGraph);
    render(audioGraph);
  }, [nodes, connections]);
}
