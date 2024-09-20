function lerp(a, b, t) {
  return a + (b - a) * t;
}

const MAX_DELAY_TIME = 1;

class MonoDelayProcessor {
  constructor() {
    this.delayBuffer = new Float32Array(sampleRate * MAX_DELAY_TIME);
    this.writeIndex = 0;
    this.previousDelayTimeSamples = undefined;
  }

  process(inputChannel, outputChannel, delayTimeParam, feedbackParam) {
    for (let i = 0; i < inputChannel.length; i++) {
      const delayTime =
        delayTimeParam.length > 1 ? delayTimeParam[i] : delayTimeParam[0];
      const feedback =
        feedbackParam.length > 1 ? feedbackParam[i] : feedbackParam[0];

      // Calculate the delay time in samples, and interpolate between old and new delay time
      const delayInSamples = delayTime * sampleRate;
      const previousDelayInSamples =
        this.previousDelayTimeSamples ?? delayInSamples;

      const interpolatedDelayInSamples = lerp(
        previousDelayInSamples,
        delayInSamples,
        0.0001,
      );

      const firstSampleIndex = this.getReadIndex(interpolatedDelayInSamples);
      const secondSampleIndex =
        (firstSampleIndex + 1) % this.delayBuffer.length;
      const secondSampleWeight =
        interpolatedDelayInSamples - Math.floor(interpolatedDelayInSamples);
      const delayedSample = lerp(
        this.delayBuffer[firstSampleIndex],
        this.delayBuffer[secondSampleIndex],
        secondSampleWeight,
      );

      // Write the current sample into the delay buffer with feedback
      this.delayBuffer[this.writeIndex] =
        inputChannel[i] + delayedSample * feedback;

      // Output the delayed sample
      outputChannel[i] = delayedSample;

      // Update the write index
      this.writeIndex = (this.writeIndex + 1) % this.delayBuffer.length;
      this.previousDelayTimeSamples = interpolatedDelayInSamples;
    }
  }

  getReadIndex(delayInSamples) {
    return (
      (this.writeIndex - Math.floor(delayInSamples) + this.delayBuffer.length) %
      this.delayBuffer.length
    );
  }
}

class FeedbackDelayProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "delayTime",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: MAX_DELAY_TIME,
      },
      {
        name: "feedback",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: MAX_DELAY_TIME,
      },
    ];
  }

  constructor() {
    super();
    this.monoProcessors = [new MonoDelayProcessor(), new MonoDelayProcessor()];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const delayTimeParam = parameters.delayTime;
    const feedbackParam = parameters.feedback;

    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      const monoProcessor = this.monoProcessors[channel];

      monoProcessor.process(
        inputChannel,
        outputChannel,
        delayTimeParam,
        feedbackParam,
      );
    }
    return true;
  }
}

registerProcessor("feedback-delay-processor", FeedbackDelayProcessor);
