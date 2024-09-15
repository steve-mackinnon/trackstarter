import { AudioContext, IAudioNode } from "standardized-audio-context";
import { Note } from "tonal";
import { Node, SequencerEvent, SequencerNode } from "./audioGraph";

type AudioNode = IAudioNode<AudioContext>;

function lengthOf16thNoteInSeconds(bpm: number): number {
  const secondsPerBeat = 60 / bpm;
  const lengthOf16thNote = secondsPerBeat / 4;
  return lengthOf16thNote;
}

export class Sequencer {
  constructor(
    private node: SequencerNode,
    private findNode: (key: string) => Node | null,
    private triggerAudioNode: (
      node: Node,
      frequency: number,
      startTime: number,
      endTime: number,
    ) => AudioNode | undefined,
    public bpm: number,
  ) {}

  // Map from step index when osc stops to osc nodes
  private activeNodes: Map<number, AudioNode[]> = new Map();

  public setNode(node: SequencerNode) {
    this.node = node;
  }

  public playStep(stepIndex: number, time: number) {
    // All active oscs at stepIndex are now stopped, so drop those refs
    this.activeNodes.delete(stepIndex);

    stepIndex = stepIndex % this.node.props.length;
    const events = this.node.props.notes.filter(
      (e) => e.startStep === stepIndex,
    );
    if (events.length === 0) {
      return;
    }
    const stepDuration = lengthOf16thNoteInSeconds(this.bpm);
    for (const nodeKey of this.node.props.destinationNodes) {
      const node = this.findNode(nodeKey);
      if (!node) {
        throw new Error(
          `Unable to connect sequencer to node with key: ${nodeKey}`,
        );
      }
      for (const event of events) {
        const freq = Note.freq(event.note);
        if (freq === null) {
          throw new Error("Failed to convert note to frequency");
        }
        const eventDuration = (event.endStep - event.startStep) * stepDuration;
        const destNode = this.triggerAudioNode(
          node,
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
    const stepDuration = lengthOf16thNoteInSeconds(this.bpm);
    for (const nodeKey of this.node.props.destinationNodes) {
      const node = this.findNode(nodeKey);
      if (!node) {
        throw new Error(
          `Unable to connect sequencer to node with key: ${nodeKey}`,
        );
      }
      for (const event of events) {
        const freq = Note.freq(event.note);
        if (freq === null) {
          throw new Error("Failed to convert note to frequency");
        }
        const eventDuration = (event.endStep - event.startStep) * stepDuration;
        const destNode = this.triggerAudioNode(
          node,
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
    const cleanupIndex = (endStep + 1) % this.node.props.length;
    const existingNodes = this.activeNodes.get(cleanupIndex);
    if (existingNodes) {
      existingNodes.push(node);
    } else {
      this.activeNodes.set(cleanupIndex, [node]);
    }
  }
}
