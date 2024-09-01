export interface ADSRProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class ADSR extends ConstantSourceNode {
  constructor(audioContext: AudioContext, private props: ADSRProps) {
    super(audioContext, { offset: 0 });
    this.offset.value = 0;
    this.start();
  }

  update(props: ADSRProps) {
    this.props = props;
  }

  trigger(startTime: number, stopTime: number) {
    this.offset.cancelScheduledValues(startTime);
    this.offset.setValueAtTime(0, startTime);
    // Attack
    this.offset.linearRampToValueAtTime(1, startTime + this.props.attack);
    const reachedSustainTime = Math.min(
      stopTime,
      startTime + this.props.attack + this.props.decay,
    );
    // Decay
    this.offset.linearRampToValueAtTime(this.props.sustain, reachedSustainTime);
    // Sustain
    this.offset.setValueAtTime(this.props.sustain, stopTime);
    // Release
    this.offset.linearRampToValueAtTime(0, stopTime + this.props.release);
  }
}
