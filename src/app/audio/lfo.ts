import {
  AudioContext,
  GainNode,
  IAudioParam,
  OscillatorNode,
} from "standardized-audio-context";
import { LFOProps } from "./webAudioNodes";

export class LFO {
  constructor(audioContext: AudioContext) {
    this.gain = audioContext.createGain();
    this.osc = audioContext.createOscillator();
    this.osc.connect(this.gain);
    this.update(this.props);
    this.osc.start();
  }

  private gain: GainNode<AudioContext>;
  private osc: OscillatorNode<AudioContext>;
  private props: LFOProps = { frequency: 2, type: "sine", amount: 10 };

  update(props: LFOProps) {
    this.props = props;
    this.osc.frequency.value = props.frequency;
    this.osc.type = props.type;
    this.gain.gain.value = props.amount;
  }

  connect(param: IAudioParam) {
    this.gain.connect(param);
  }

  disconnect(param: IAudioParam) {
    this.gain.disconnect(param);
  }
}
