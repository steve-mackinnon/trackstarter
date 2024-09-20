class MasterClipperProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    const a = 19;
    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      for (let i = 0; i < inputChannel.length; i++) {
        const sample = inputChannel[i];
        const x = Math.min(1, Math.max(sample, -1));
        outputChannel[i] = x - (1 / a) * Math.pow(x, a);
      }
    }
    return true;
  }
}

registerProcessor("master-clipper-processor", MasterClipperProcessor);
