import * as Tone from "tone";
import { Node, OscNode, SequencerNode } from "./audioGraph";
import { semitonesToHz } from "./utils";

function getActiveSteps(length: number, numSteps: number): Set<number> {
  const indices: Set<number> = new Set();
  const stepInterval = length / numSteps;

  for (let i = 0; i < numSteps; i++) {
    const index = Math.floor(i * stepInterval);
    indices.add(index);
  }
  return indices;
}

export class Sequencer {
  constructor(
    private node: SequencerNode,
    private findNode: (key: string) => Node | null,
    private buildOsc: (destNode: Node) => OscillatorNode,
  ) {}

  playStep(stepIndex: number, time: number) {
    stepIndex = stepIndex % this.node.props.length;
    const activeSteps = getActiveSteps(
      this.node.props.length,
      this.node.props.steps,
    );
    if (activeSteps.has(stepIndex)) {
      for (const nodeKey of this.node.props.destinationNodes) {
        const destNode = this.findNode(nodeKey);
        if (!destNode || destNode.type !== "osc") {
          throw new Error(
            `Unable to connect sequencer to node with key: ${nodeKey}`,
          );
        }
        const osc = this.buildOsc(destNode);
        osc.frequency.value = semitonesToHz(
          this.node.props.transposition,
          (destNode as OscNode).props.frequency,
        );
        osc.start(time);
        osc.stop(time + 0.1);
      }
    }
  }
}
