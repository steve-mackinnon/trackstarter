import { Note } from "tonal";
import * as Tone from "tone";
import { Node, SequencerEvent, SequencerNode } from "./audioGraph";

function getActiveSteps(length: number, numSteps: number): Set<number> {
  const indices: Set<number> = new Set();
  const stepInterval = length / numSteps;

  for (let i = 0; i < numSteps; i++) {
    const index = Math.floor(i * stepInterval);
    indices.add(index);
  }
  return indices;
}

function lengthOf16thNoteInSeconds(bpm: number): number {
  const secondsPerBeat = 60 / bpm;
  const lengthOf16thNote = secondsPerBeat / 4;
  return lengthOf16thNote;
}

export class Sequencer {
  constructor(
    private node: SequencerNode,
    private findNode: (key: string) => Node | null,
    private buildOsc: (destNode: Node) => OscillatorNode
  ) {}

  setNode(node: SequencerNode) {
    this.node = node;
  }

  playStep(stepIndex: number, time: number) {
    stepIndex = stepIndex % this.node.props.length;
    // TODO: proper type guard for SequencerEvent[]
    if (
      this.node.props.notes.length &&
      (this.node.props.notes[0] as SequencerEvent).note !== undefined
    ) {
      this.playSequencerEvents(
        stepIndex,
        time,
        this.node.props.notes as SequencerEvent[]
      );
      return;
    }
    const activeSteps = getActiveSteps(
      this.node.props.length,
      this.node.props.steps
    );
    if (activeSteps.has(stepIndex)) {
      const noteIndex = stepIndex % this.node.props.notes.length;
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
        const freq = Note.freq(this.node.props.notes[noteIndex] as string);
        if (freq == null) {
          throw new Error("Error determining note frequency");
        }
        osc.frequency.value = freq;
        osc.start(time);
        osc.stop(time + 0.1);
      }
    }
  }

  private playSequencerEvents(
    stepIndex: number,
    time: number,
    events: SequencerEvent[]
  ) {
    events = events.filter((e) => e.startStep === stepIndex);
    if (events.length === 0) {
      return;
    }
    const stepDuration = lengthOf16thNoteInSeconds(
      Tone.getTransport().bpm.value
    );
    for (const nodeKey of this.node.props.destinationNodes) {
      const oscNode = this.findNode(nodeKey);
      if (!oscNode || oscNode.type !== "osc") {
        throw new Error(
          `Unable to connect sequencer to node with key: ${nodeKey}`
        );
      }
      for (const event of events) {
        const osc = this.buildOsc(oscNode);
        const freq = Note.freq(event.note);
        if (freq === null) {
          throw new Error("Failed to convert note to frequency");
        }
        osc.frequency.value = freq;
        osc.start(time);
        const eventDuration = (event.endStep - event.startStep) * stepDuration;
        osc.stop(time + eventDuration);
      }
    }
  }
}
