//@ts-ignore
import feedbackDelayWorklet from "audio/worklets/feedbackDelay.audioworklet.js";
//@ts-ignore
import masterClipperWorklet from "audio/worklets/masterClipper.audioworklet.js";
import {
  AudioContext,
  AudioWorkletNode,
  GainNode,
  IAudioContext,
  IAudioNode,
  IAudioParam,
  OscillatorNode,
} from "standardized-audio-context";
import { ADSR } from "./adsr";
import { AudioGraphDelegate, FindNode } from "./graph";
import { LFO } from "./lfo";
import { Reverb } from "./reverb";
import { Scheduler } from "./scheduler";
import { Sequencer } from "./sequencer";
import {
  ADSRNode,
  ModInfo,
  Node,
  OscNode,
  OscProps,
  SampleNode,
} from "./webAudioNodes";

const BPM = 160;

async function loadWorklet(context: AudioContext, script: string) {
  const blob = new Blob([script], { type: "application/javascript" });
  const blobURL = URL.createObjectURL(blob);
  await context.audioWorklet?.addModule(blobURL);
}

async function addWorklets(context: AudioContext) {
  await Promise.all([
    loadWorklet(context, feedbackDelayWorklet),
    loadWorklet(context, masterClipperWorklet),
  ]);
}

export class WebAudioDelegate implements AudioGraphDelegate {
  constructor(private context: AudioContext) {
    this.workletPromise = addWorklets(this.context);
    this.scheduler.tempo = BPM;
  }

  async initialize() {
    await this.workletPromise;
  }

  private workletPromise: Promise<void>;
  private sequencers = new Map<string, Sequencer>();
  private stepIndex = 0;
  private scheduler = new Scheduler(this.context, (t) => {
    this.sequencers.forEach((seq) => {
      seq.playStep(this.stepIndex, t);
    });
    this.stepIndex = (this.stepIndex + 1) % 1024;
  });

  async createNode(
    type: Node["type"],
    findNode: FindNode,
    getSample: (key: string) => AudioBuffer | undefined,
    key?: string,
  ) {
    switch (type) {
      case "osc": {
        // Osc nodes are created dynamically when they are triggered by a sequence
        return null;
      }
      case "lfo": {
        return new LFO(this.context);
      }
      case "filter": {
        return this.context.createBiquadFilter();
      }
      case "destination":
        return this.context.destination;
      case "mul":
        return this.context.createGain();
      case "adsr":
        // ADSR nodes are built on the fly when triggered
        return null;
      case "delay": {
        if (AudioWorkletNode) {
          const delay = new AudioWorkletNode(
            this.context,
            "feedback-delay-processor",
          );
          // We need to pipe a dummy input into the delay node to ensure it doesn't stop
          // producing audio after a source is disconnected from it. Without this, feedback
          // signal from the delay line can stop abruptly.
          const dummySource = this.context.createConstantSource();
          dummySource.offset.value = 0;
          dummySource.connect(delay);
          dummySource.start();
          return delay;
        }
        return null;
      }
      case "master-clipper": {
        if (AudioWorkletNode) {
          return new AudioWorkletNode(this.context, "master-clipper-processor");
        }
        return null;
      }
      case "sequencer": {
        const seq = new Sequencer(
          (key) => findNode(key),
          (node, freq, startTime, endTime) => {
            if (node.type === "osc") {
              return buildOscNode(
                this.context,
                node,
                freq,
                startTime,
                endTime,
                (key) => findNode(key),
              );
            } else if (node.type === "sample") {
              return buildSampleNode(
                this.context,
                node,
                (key) => getSample(key),
                startTime,
                endTime,
              );
            }
          },
          BPM,
        );
        if (!key) {
          throw new Error("Key must be provided for sequencer nodes");
        }
        this.sequencers.set(key, seq);
        return seq;
      }
      case "sample": {
        // Sample nodes are created dynamically when they are triggered by a sequence
        return null;
      }
      case "reverb": {
        return new Reverb(this.context, { wetMix: 0.5 });
      }
      default:
        // Guard against unhandled Node.type enum cases
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
    }
  }

  deleteNode(node: Node) {
    if (node.key && this.sequencers.has(node.key)) {
      this.sequencers.delete(node.key);
    }
    if (isAudioNode(node)) {
      node.disconnect();
    }
  }

  updateNode(node: Node, findNode: FindNode) {
    if (!node.backingNode) {
      return;
    }
    switch (node.type) {
      case "filter": {
        node.backingNode.frequency.value = node.props.frequency;
        node.backingNode.type = node.props.type;
        node.backingNode.Q.value = node.props.q;
        if (node.props.modSources) {
          node.props.modSources.frequency?.forEach((modInfo) =>
            connectModSource(modInfo, node.backingNode!.frequency, findNode),
          );
        }
        break;
      }
      case "mul": {
        node.backingNode.gain.value = node.props.multiplier;
        break;
      }
      case "adsr": {
        node.backingNode.update(node.props);
        break;
      }
      case "delay": {
        const delayTime = (node.backingNode as any).parameters.get(
          "delayTime",
        ) as IAudioParam;
        delayTime.value = node.props.time;
        (node.backingNode as any).parameters.get("feedback")!.value =
          node.props.feedback;
        if (node.props.modSources) {
          node.props.modSources.time?.forEach((modInfo) => {
            connectModSource(modInfo, delayTime, findNode);
          });
        }
        break;
      }
      case "sequencer": {
        (node.backingNode as Sequencer).update(node.props);
        break;
      }
      case "lfo": {
        node.backingNode?.update(node.props);
        break;
      }
      case "reverb": {
        (node.backingNode as Reverb).update(node.props);
        break;
      }
      case "master-clipper":
      case "osc":
        break;
    }
  }

  connectNodes(src: Node, dest: Node) {
    if (!shouldConnectToParent(src.type)) {
      return;
    }
    if (isAudioNode(src.backingNode) && isAudioNode(dest.backingNode)) {
      if (hasInput(dest.backingNode)) {
        src.backingNode.connect(dest.backingNode.getInput());
      } else {
        src.backingNode.connect(dest.backingNode);
      }
    }
  }

  async start(step?: number) {
    this.stepIndex = step ?? 0;
    this.scheduler.start();
  }

  stop() {
    this.scheduler.stop();
  }

  isPlaying(): boolean {
    return this.scheduler.isPlaying();
  }
}

function isAudioNode(obj: any): obj is AudioNode {
  return (
    obj &&
    typeof obj.connect === "function" &&
    typeof obj.disconnect === "function"
  );
}

interface HasInput {
  getInput(): AudioNode;
}

function hasInput(node: any): node is HasInput {
  return node && typeof node.getInput === "function";
}

function shouldConnectToParent(type: Node["type"]) {
  return type !== "lfo" && type !== "adsr";
}

function buildOscNode(
  context: IAudioContext,
  node: OscNode,
  freq: number,
  startTime: number,
  endTime: number,
  findNode: FindNode,
) {
  const oscNode = context.createOscillator();
  const oscType = node.props.type;
  oscNode.type = oscType;
  oscNode.frequency.value = freq;

  const oscGain = context.createGain();
  oscGain.gain.value = 1;
  oscNode.connect(oscGain);
  if (node.parent?.backingNode) {
    if (hasInput(node.parent.backingNode)) {
      oscGain.connect(
        node.parent.backingNode.getInput() as any as IAudioNode<AudioContext>,
      );
    } else {
      oscGain.connect(
        node.parent.backingNode as any as IAudioNode<AudioContext>,
      );
    }
  }

  const stopTime = connectOscModulators(
    context,
    node.props,
    oscNode,
    oscGain,
    startTime,
    endTime,
    findNode,
  );
  oscNode.start(startTime);
  oscNode.stop(stopTime);

  // Ensure the oscNode is fully disconnected after it has stopped to prevent leaks
  oscNode.addEventListener("ended", () => {
    oscNode.disconnect();
    oscGain.disconnect();
  });
  return oscNode;
}

// Returns updated endTime in case release is applied to osc gain
function connectOscModulators(
  context: IAudioContext,
  props: OscProps,
  osc: OscillatorNode<AudioContext>,
  gain: GainNode<AudioContext>,
  startTime: number,
  endTime: number,
  findNode: FindNode,
): number {
  let endTimeIncrease = 0;
  [
    {
      sources: props.modSources?.frequency,
      param: osc.frequency,
      type: "freq",
    },
    { sources: props.modSources?.gain, param: gain.gain, type: "gain" },
  ]
    .filter((m) => !!m.sources && m.sources.length > 0)
    .forEach((modSettings) => {
      modSettings.sources?.forEach(({ key, amount }) => {
        const modulator = findNode(key);
        if (modulator) {
          if (modulator.type !== "adsr" && modulator.type !== "lfo") {
            throw new Error(`Invalid modulator type: ${modulator.type}`);
          }
          if (modSettings.type === "gain") {
            // When modulated, rely on modulators to determine the oscillator's gain value
            gain.gain.value = 0;
          }
          if (modulator.type === "adsr") {
            const envNode = buildADSRNode(
              context,
              modulator,
              startTime,
              endTime,
            );
            envNode.connect(modSettings.param);
            if (modSettings.type === "gain") {
              endTimeIncrease = Math.max(
                endTimeIncrease,
                modulator.props.release,
              );
            }
            osc.addEventListener("ended", function () {
              envNode.disconnect();
            });
          } else if (modulator.type === "lfo") {
            modulator.backingNode!.connect(modSettings.param, amount);
            osc.addEventListener("ended", () => {
              modulator.backingNode!.disconnect(modSettings.param);
            });
          }
        }
      });
    });
  return endTime + endTimeIncrease;
}

function connectModSource(
  modInfo: ModInfo,
  param: IAudioParam,
  findNode: FindNode,
) {
  const modulator = findNode(modInfo.key);
  if (!modulator) {
    throw new Error(`Failed to find modulator: ${modInfo.key}`);
  }
  if (modulator.type !== "adsr" && modulator.type !== "lfo") {
    throw new Error(`Invalid modulator type: ${modulator.type}`);
  }
  modulator.backingNode!.connect(param, modInfo.amount);
}

function buildADSRNode(
  context: IAudioContext,
  node: ADSRNode,
  startTime: number,
  endTime: number,
) {
  const adsrNode = new ADSR(context, node.props);
  adsrNode.trigger(startTime, endTime);
  return adsrNode;
}

function buildSampleNode(
  context: IAudioContext,
  node: SampleNode,
  getSample: (id: string) => AudioBuffer | undefined,
  startTime: number,
  endTime: number,
) {
  const sampleNode = context.createBufferSource();
  const sample = getSample(node.props.sampleId);
  if (!sample) {
    throw new Error(`Sample not found: ${node.props.sampleId}`);
  }
  sampleNode.buffer = sample;

  if (node.parent?.backingNode) {
    if (hasInput(node.parent.backingNode)) {
      sampleNode.connect(
        node.parent.backingNode.getInput() as any as IAudioNode<AudioContext>,
      );
    } else {
      sampleNode.connect(
        node.parent.backingNode as any as IAudioNode<AudioContext>,
      );
    }
  } else {
    throw new Error("Sample node has an invalid parent");
  }
  sampleNode.start(startTime);
  sampleNode.stop(startTime + node.props.lengthMs * 1000);
  return sampleNode;
}
