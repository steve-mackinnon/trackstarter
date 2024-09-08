class MasterClipperProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    const a = 4.4;
    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      for (let i = 0; i < inputChannel.length; i++) {
        const sample = inputChannel[i];
        // f(x) = sgn(x) * tanh((x^2)^a/2)^1/a
        outputChannel[i] =
          Math.sign(sample) *
          Math.pow(Math.tanh(Math.pow(sample * sample, a / 2)), 1 / a);
      }
    }
    return true;
  }
}

registerProcessor("master-clipper-processor", MasterClipperProcessor);
