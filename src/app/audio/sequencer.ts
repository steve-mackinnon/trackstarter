import { Note } from "tonal";
import * as Tone from "tone";
import { SequencerEvent } from "./audioGraph";
import { SequencerProps } from "./webAudioNodes";

function lengthOf16thNoteInSeconds(bpm: number): number {
  const secondsPerBeat = 60 / bpm;
  const lengthOf16thNote = secondsPerBeat / 4;
  return lengthOf16thNote;
}

export class Sequencer {
  constructor(
    private triggerAudioNode: (
      node: string,
      frequency: number,
      startTime: number,
      endTime: number,
    ) => AudioNode | undefined,
  ) {}

  private props: SequencerProps = {
    rate: "16n",
    transposition: 0,
    destinationNodes: [],
    steps: 3,
    length: 16,
    octave: 3,
    probability: 1,
    notes: ["D2", "D#2", "F1", "G3", "F2", "F2", "D#1", "C#2"],
  };

  // Map from step index when osc stops to osc nodes
  private activeNodes: Map<number, AudioNode[]> = new Map();

  public update(props: SequencerProps) {
    this.props = props;
  }

  public playStep(stepIndex: number, time: number) {
    // All active oscs at stepIndex are now stopped, so drop those refs
    this.activeNodes.delete(stepIndex);

    stepIndex = stepIndex % this.props.length;
    // TODO: proper type guard for SequencerEvent[]
    if (
      this.props.notes.length &&
      (this.props.notes[0] as SequencerEvent).note !== undefined
    ) {
      this.playSequencerEvents(
        stepIndex,
        time,
        this.props.notes as SequencerEvent[],
      );
      return;
    }
  }

  public stop() {
    for (const [_, node] of this.activeNodes) {
      node.forEach((node) => {
        if (node instanceof OscillatorNode) {
          (node as OscillatorNode).stop();
        }
      });
    }
    this.activeNodes.clear();
  }

  private playSequencerEvents(
    stepIndex: number,
    time: number,
    events: SequencerEvent[],
  ) {
    events = events.filter((e) => e.startStep === stepIndex);
    if (events.length === 0) {
      return;
    }
    const stepDuration = lengthOf16thNoteInSeconds(
      Tone.getTransport().bpm.value,
    );
    for (const nodeKey of this.props.destinationNodes) {
      for (const event of events) {
        const freq = Note.freq(event.note);
        if (freq === null) {
          throw new Error("Failed to convert note to frequency");
        }
        const eventDuration = (event.endStep - event.startStep) * stepDuration;
        const destNode = this.triggerAudioNode(
          nodeKey,
          freq,
          time,
          time + eventDuration,
        );
        if (destNode) {
          this.addToNodeMap(destNode, event.endStep);
        }
      }
    }
  }

  private addToNodeMap(node: AudioNode, endStep: number) {
    const cleanupIndex = (endStep + 1) % this.props.length;
    const existingNodes = this.activeNodes.get(cleanupIndex);
    if (existingNodes) {
      existingNodes.push(node);
    } else {
      this.activeNodes.set(cleanupIndex, [node]);
    }
  }
}
