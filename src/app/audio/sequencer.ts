import { AudioContext, IAudioNode } from "standardized-audio-context";
import { Note } from "tonal";
import { Node, SequencerProps } from "./webAudioNodes";

type AudioNode = IAudioNode<AudioContext>;

function lengthOf16thNoteInSeconds(bpm: number): number {
  const secondsPerBeat = 60 / bpm;
  const lengthOf16thNote = secondsPerBeat / 8;
  return lengthOf16thNote;
}

export class Sequencer {
  constructor(
    private findNode: (key: string) => Node | undefined,
    private triggerAudioNode: (
      node: Node,
      frequency: number,
      startTime: number,
      endTime: number,
    ) => AudioNode | undefined,
    public bpm: number,
  ) {}

  private props: SequencerProps = {
    destinationNodes: [],
    length: 16,
    notes: [],
  };

  public update(props: SequencerProps) {
    this.props = props;
  }

  public playStep(stepIndex: number, time: number) {
    stepIndex = stepIndex % this.props.length;
    const events = this.props.notes.filter((e) => e.startStep === stepIndex);
    if (events.length === 0) {
      return;
    }
    const stepDuration = lengthOf16thNoteInSeconds(this.bpm);
    for (const nodeKey of this.props.destinationNodes) {
      const node = this.findNode(nodeKey);
      if (!node) {
        throw new Error(
          `Unable to connect sequencer to node with key: ${nodeKey}`,
        );
      }
      for (const event of events) {
        const freq = Note.freq(event.note);
        if (freq === null) {
          throw new Error(`Failed to convert note to frequency: ${event.note}`);
        }
        const eventDuration = (event.endStep - event.startStep) * stepDuration;
        const destNode = this.triggerAudioNode(
          node,
          freq,
          time,
          time + eventDuration,
        );
      }
    }
  }
}
