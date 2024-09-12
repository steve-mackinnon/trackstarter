import { BaseContext } from "tone";

export interface ADSRProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class ADSR {
  constructor(audioContext: BaseContext, private props: ADSRProps) {
    this.constantSource = audioContext.createConstantSource();
    this.constantSource.offset.value = 0;
    this.constantSource.start();
  }

  private constantSource: ConstantSourceNode;

  update(props: ADSRProps) {
    this.props = props;
  }

  connect(node: AudioParam) {
    this.constantSource.connect(node);
  }

  trigger(startTime: number, stopTime: number) {
    this.constantSource.offset.cancelScheduledValues(startTime);
    this.constantSource.offset.setValueAtTime(0, startTime);
    // Attack
    this.constantSource.offset.linearRampToValueAtTime(
      1,
      startTime + this.props.attack,
    );
    const reachedSustainTime = Math.min(
      stopTime,
      startTime + this.props.attack + this.props.decay,
    );
    // Decay
    this.constantSource.offset.linearRampToValueAtTime(
      this.props.sustain,
      reachedSustainTime,
    );
    // Sustain
    this.constantSource.offset.setValueAtTime(this.props.sustain, stopTime);
    // Release
    this.constantSource.offset.linearRampToValueAtTime(
      0,
      stopTime + this.props.release,
    );
  }
}
