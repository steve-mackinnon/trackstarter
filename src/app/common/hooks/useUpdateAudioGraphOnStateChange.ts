import { Node, render, SequencerNode } from "audio/audioGraph";
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

    const sequencers: SequencerNode[] = [];
    const populateAudioGraph = (root: Node) => {
      if (root.type === "sequencer") {
        // Push sequencers to a flat array to be added as top-level children
        // after the graph is populated.
        sequencers.push(root);
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
              ? [...r.children, populateAudioGraph(child as Node)]
              : [populateAudioGraph(child as Node)];
          });
        }
      }
      return root;
    };
    let audioGraph = populateAudioGraph({
      ...output(undefined, []),
      key: destNode.key,
    });
    // Add sequencers separately
    audioGraph = produce(audioGraph, (ag) => {
      ag.children.push(...sequencers);
    });

    render(audioGraph);
  }, [nodes, connections]);
}
