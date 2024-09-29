import {
  AudioContext,
  ConvolverNode,
  GainNode,
  IAudioNode,
} from "standardized-audio-context";

export interface ReverbProps {
  wetMix: number;
}

let reverbBuffer: AudioBuffer | null = null;
const getReverbBuffer = async (context: AudioContext) => {
  if (!reverbBuffer) {
    const response = await fetch("/audio/reverb-ir.wav");
    const arrayBuffer = await response.arrayBuffer();
    reverbBuffer = await context.decodeAudioData(arrayBuffer);
  }
  return reverbBuffer;
};

export class Reverb {
  constructor(audioContext: AudioContext, private props: ReverbProps) {
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.wetGain.gain.value = props.wetMix;
    this.dryGain = audioContext.createGain();
    this.dryGain.gain.value = 1 - props.wetMix;
    this.convolver = audioContext.createConvolver();
    getReverbBuffer(audioContext).then((buffer) => {
      this.convolver.buffer = buffer;
    });
    this.input.connect(this.dryGain).connect(this.output);
    this.input
      .connect(this.wetGain)
      .connect(this.convolver)
      .connect(this.output);
  }

  private input: GainNode<AudioContext>;
  private output: GainNode<AudioContext>;
  private wetGain: GainNode<AudioContext>;
  private dryGain: GainNode<AudioContext>;
  private convolver: ConvolverNode<AudioContext>;

  update(props: ReverbProps) {
    this.wetGain.gain.value = props.wetMix;
    this.dryGain.gain.value = 1 - props.wetMix;
  }

  getInput() {
    return this.input;
  }

  connect(node: IAudioNode<AudioContext>) {
    this.output.connect(node);
  }

  disconnect() {
    this.convolver.disconnect();
  }
}
