export interface FeedbackDelayProps {
  feedback: number;
  time: number;
}

export class FeedbackDelay {
  constructor(private context: AudioContext, props: FeedbackDelayProps) {
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
    this.delay.delayTime.linearRampToValueAtTime(
      props.time,
      this.context.currentTime + 0.1,
    );
    this.feedbackGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(props.feedback, 1)),
      this.context.currentTime + 0.02,
    );
  }

  get input(): DelayNode {
    return this.delay;
  }

  private delay: DelayNode;
  private feedbackGain: GainNode;
  private outputGain: GainNode;
}
