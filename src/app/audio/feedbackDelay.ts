export interface FeedbackDelayProps {
  feedback: number;
  time: number;
}

export class FeedbackDelay {
  constructor(context: AudioContext, props: FeedbackDelayProps) {
    this.delay = context.createDelay();
    this.feedbackGain = context.createGain();
    this.outputGain = context.createGain();

    this.delay
      .connect(this.feedbackGain)
      .connect(this.delay)
      .connect(this.outputGain);

    this.update(props);
  }

  connect(dest: AudioNode) {
    return this.outputGain.connect(dest);
  }

  disconnect() {
    this.outputGain.disconnect();
  }

  update(props: FeedbackDelayProps) {
    if (props.time > 1) {
      throw new Error("Delay time > 1 second unsupported");
    }
    this.delay.delayTime.value = props.time;
    this.feedbackGain.gain.value = Math.max(0, Math.min(props.feedback, 1));
  }

  get input(): DelayNode {
    return this.delay;
  }

  private delay: DelayNode;
  private feedbackGain: GainNode;
  private outputGain: GainNode;
}
