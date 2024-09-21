import {
  AudioContext,
  GainNode,
  IAudioParam,
  OscillatorNode,
} from "standardized-audio-context";
import { LFOProps } from "./webAudioNodes";

type Connection = {
  param: IAudioParam;
  gain: GainNode<AudioContext>;
};

export class LFO {
  constructor(private audioContext: AudioContext) {
    this.osc = audioContext.createOscillator();
    this.osc.start();
    this.update(this.props);
  }

  private osc: OscillatorNode<AudioContext>;
  private props: LFOProps = { frequency: 2, type: "sine" };
  private connections: Connection[] = [];

  update(props: LFOProps) {
    this.props = props;
    this.osc.frequency.value = props.frequency;
    this.osc.type = props.type;
  }

  connect(param: IAudioParam, amount: number) {
    const gain = this.audioContext.createGain();
    gain.gain.value = amount;
    this.osc.connect(gain);
    gain.connect(param);
    this.connections.push({ param, gain });
  }

  disconnect(param: IAudioParam) {
    const gain = this.connections.find((c) => c.param === param)?.gain;
    if (gain) {
      this.osc.disconnect(gain);
      gain.disconnect(param);
      this.connections = this.connections.filter((c) => c.param !== param);
    } else {
      throw new Error("Failed to find connection to disconnect");
    }
  }
}
