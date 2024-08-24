import { Node, SequencerNode } from "./audioGraph";

function noteToFrequency(
  note: string,
  octave: number,
  detuneCents: number
): number {
  const noteMap: { [key: string]: number } = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  const midiNumber = 12 * (octave + 1) + noteMap[note];
  const frequency = 440 * Math.pow(2, (midiNumber - 49) / 12);
  if (detuneCents !== 0) {
    return frequency * Math.pow(2, detuneCents / 1200);
  }
  return frequency;
}

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
    private buildOsc: (destNode: Node) => OscillatorNode
  ) {}

  playStep(stepIndex: number, time: number) {
    stepIndex = stepIndex % this.node.props.length;
    const activeSteps = getActiveSteps(
      this.node.props.length,
      this.node.props.steps
    );
    if (activeSteps.has(stepIndex)) {
      for (const nodeKey of this.node.props.destinationNodes) {
        const oscNode = this.findNode(nodeKey);
        if (!oscNode || oscNode.type !== "osc") {
          throw new Error(
            `Unable to connect sequencer to node with key: ${nodeKey}`
          );
        }
        if (
          this.node.props.probability < 1 &&
          Math.random() > this.node.props.probability
        ) {
          continue;
        }
        const osc = this.buildOsc(oscNode);
        const frequency = noteToFrequency(
          this.node.props.rootNote,
          this.node.props.octave,
          oscNode.props.detune
        );
        osc.frequency.value = frequency;
        osc.start(time);
        osc.stop(time + 0.1);
      }
    }
  }
}
