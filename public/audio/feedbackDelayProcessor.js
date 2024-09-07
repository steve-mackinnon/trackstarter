function lerp(a, b, t) {
  return a + (b - a) * t;
}

class FeedbackDelayProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "delayTime", defaultValue: 0.5, minValue: 0, maxValue: 1 },
      { name: "feedback", defaultValue: 0.5, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this.delayBuffer = new Float32Array(44100); // 1 second buffer at 44100 Hz
    this.writeIndex = 0;
    this.previousDelayTime = 0.5;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const delayTimeParam = parameters.delayTime;
    const feedbackParam = parameters.feedback;

    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      for (let i = 0; i < inputChannel.length; i++) {
        const delayTime =
          delayTimeParam.length > 1 ? delayTimeParam[i] : delayTimeParam[0];
        const feedback =
          feedbackParam.length > 1 ? feedbackParam[i] : feedbackParam[0];

        // Calculate the delay time in samples, and interpolate between old and new delay time
        const delayInSamples = delayTime * sampleRate;
        const previousDelayInSamples = this.previousDelayTime * sampleRate;

        const transitionSpeed = 0.05;
        const epsilon = 1e-6;
        const delta = Math.abs(delayInSamples - previousDelayInSamples);
        const t = Math.min(1, transitionSpeed / (delta + epsilon));

        const interpolatedDelayInSamples = lerp(
          previousDelayInSamples,
          delayInSamples,
          t,
        );

        // Calculate the read index
        const readIndex =
          (this.writeIndex -
            interpolatedDelayInSamples +
            this.delayBuffer.length) %
          this.delayBuffer.length;

        // Interpolate between the neighboring samples for smooth delay
        const floorIndex = Math.floor(readIndex);
        const frac = readIndex - floorIndex;
        const delayedSample = lerp(
          this.delayBuffer[floorIndex],
          this.delayBuffer[(floorIndex + 1) % this.delayBuffer.length],
          frac,
        );

        // Write the current sample into the delay buffer with feedback
        this.delayBuffer[this.writeIndex] =
          inputChannel[i] + delayedSample * feedback;

        // Output the delayed sample
        outputChannel[i] = delayedSample;

        // Update the write index
        this.writeIndex = (this.writeIndex + 1) % this.delayBuffer.length;
        this.previousDelayTime = delayTime;
      }
    }

    return true;
  }
}

registerProcessor("feedback-delay-processor", FeedbackDelayProcessor);
