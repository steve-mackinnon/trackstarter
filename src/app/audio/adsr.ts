import {
  AudioContext,
  ConstantSourceNode,
  IAudioParam,
} from "standardized-audio-context";

export interface ADSRProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class ADSR {
  constructor(audioContext: AudioContext, private props: ADSRProps) {
    this.constantSource = audioContext.createConstantSource();
    this.constantSource.offset.value = 0;
    this.constantSource.start();
  }

  private constantSource: ConstantSourceNode<AudioContext>;

  update(props: ADSRProps) {
    this.props = props;
  }

  connect(node: IAudioParam) {
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
