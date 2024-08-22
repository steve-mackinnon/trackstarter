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
    findNode: (key: string) => Node | null,
    buildOsc: (destNode: Node) => OscillatorNode,
  ) {
    this.callbackId = Tone.getTransport().scheduleRepeat(
      (time) => {
        const activeSteps = getActiveSteps(
          this.node.props.length,
          this.node.props.steps,
        );
        if (activeSteps.has(this.stepIndex)) {
          for (const nodeKey of node.props.destinationNodes) {
            const destNode = findNode(nodeKey);
            if (!destNode || destNode.type !== "osc") {
              throw new Error(
                `Unable to connect sequencer to node with key: ${nodeKey}`,
              );
            }
            const osc = buildOsc(destNode);
            osc.frequency.value = semitonesToHz(
              node.props.transposition,
              (destNode as OscNode).props.frequency,
            );
            osc.start(time);
            osc.stop(time + 0.1);
          }
        }
        this.stepIndex = (this.stepIndex + 1) % this.node.props.length;
      },
      (node as SequencerNode).props.rate,
    );
  }

  stop() {
    Tone.getTransport().clear(this.callbackId);
  }

  private callbackId: number;
  private stepIndex = 0;
}
