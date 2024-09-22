import {
  AudioContext,
  GainNode,
  IAudioParam,
  OscillatorNode,
} from "standardized-audio-context";
import { LFOProps } from "./webAudioNodes";

export class LFO {
  constructor(private audioContext: AudioContext) {
    this.osc = audioContext.createOscillator();
    this.osc.start();
    this.update(this.props);
  }

  private osc: OscillatorNode<AudioContext>;
  private props: LFOProps = { frequency: 2, type: "sine" };
  private connections: Map<IAudioParam, GainNode<AudioContext>> = new Map();

  update(props: LFOProps) {
    this.props = props;
    this.osc.frequency.value = props.frequency;
    this.osc.type = props.type;
  }

  connect(param: IAudioParam, amount: number) {
    if (this.connections.has(param)) {
      this.connections.get(param)!.gain.value = amount;
      return;
    }
    const gain = this.audioContext.createGain();
    gain.gain.value = amount;
    this.osc.connect(gain);
    gain.connect(param);
    this.connections.set(param, gain);
  }

  disconnect(param: IAudioParam) {
    const gain = this.connections.get(param);
    if (gain) {
      this.osc.disconnect(gain);
      gain.disconnect(param);
      this.connections.delete(param);
    } else {
      throw new Error("Failed to find connection to disconnect");
    }
  }
}
