import { Node, render } from "audio/audioGraph";
import { output } from "audio/nodes";
import { produce } from "immer";
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

    const populateAudioGraph = (root: Node) => {
      if (root.type === "sequencer") {
        // Sequencer nodes should have their destinations set via props, so just
        // push them as a top-level child
        audioGraph.children?.push(root);
        return root;
      }
      const children = connections[root.key!];
      if (children) {
        for (const childId of children) {
          const child = nodes.find((n) => n.key === childId);
          if (!child) {
            throw new Error(`Could not find child with ID ${childId}`);
          }
          root = produce(root, (r) => {
            r.children = r.children
              ? [...r.children, populateAudioGraph(child)]
              : [populateAudioGraph(child)];
          });
        }
      }
      return root;
    };
    const audioGraph = output(undefined, []);
    audioGraph.key = destNode.key;
    render(populateAudioGraph(audioGraph));
  }, [nodes, connections]);
}
