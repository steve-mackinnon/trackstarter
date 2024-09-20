import {
  AudioContext,
  AudioWorkletNode,
  IAudioContext,
  IAudioNode,
} from "standardized-audio-context";
import { ADSR } from "./adsr";
import { AudioGraphDelegate } from "./graph";
import { Scheduler } from "./scheduler";
import { Sequencer } from "./sequencer";
import { ADSRNode, Node, OscNode } from "./webAudioNodes";

const BPM = 160;

async function addWorklets(context: AudioContext) {
  try {
    await context.audioWorklet?.addModule("/audio/feedbackDelayProcessor.js");
    await context.audioWorklet?.addModule("/audio/masterClipper.js");
  } catch (e) {
    console.error(e);
  }
}

export class WebAudioDelegate implements AudioGraphDelegate {
  constructor() {
    this.workletPromise = addWorklets(this.context);
    this.scheduler.tempo = BPM;
  }

  async initialize() {
    await this.workletPromise;
  }

  private workletPromise: Promise<void>;
  private context = new AudioContext();
  private sequencers = new Map<string, Sequencer>();
  private stepIndex = 0;
  private scheduler = new Scheduler(this.context, (t) => {
    this.sequencers.forEach((seq) => {
      seq.playStep(this.stepIndex, t);
    });
    this.stepIndex = (this.stepIndex + 1) % 1024;
  });

  createNode(
    type: string,
    findNode: (key: string) => Node | null,
    key?: string,
  ) {
    switch (type) {
      case "osc": {
        // Osc nodes are created dynamically when they are triggered by a sequence
        return null;
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
          return new AudioWorkletNode(this.context, "feedback-delay-processor");
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

  updateNode(node: Node) {
    if (!node.backingNode) {
      return;
    }
    switch (node.type) {
      case "filter": {
        node.backingNode.frequency.value = node.props.frequency;
        node.backingNode.type = node.props.type;
        node.backingNode.Q.value = node.props.q;
        break;
      }
      case "mul": {
        node.backingNode.gain.value = node.props.multiplier;
        break;
      }
      case "adsr": {
        // TODO: split out prop update handlers into a separate place
        node.backingNode.update(node.props);
        break;
      }
      case "delay": {
        (node.backingNode as any).parameters.get("delayTime")!.value =
          node.props.time;
        (node.backingNode as any).parameters.get("feedback")!.value =
          node.props.feedback;
        break;
      }
      case "sequencer": {
        (node.backingNode as Sequencer).update(node.props);
        break;
      }
    }
  }

  connectNodes(src: Node, dest: Node) {
    if (isAudioNode(src.backingNode) && isAudioNode(dest.backingNode)) {
      src.backingNode.connect(dest.backingNode);
    } else {
      console.error("Failed to connect nodes");
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

function buildOscNode(
  context: IAudioContext,
  node: OscNode,
  freq: number,
  startTime: number,
  endTime: number,
  findNode: (key: string) => Node | null,
) {
  const oscNode = context.createOscillator();
  const oscType = node.props.type;
  oscNode.type = oscType;
  oscNode.frequency.value = freq;
  oscNode.start(startTime);
  let oscStopTime = endTime;

  const oscGain = context.createGain();
  oscNode.connect(oscGain);
  if (
    node.parent?.backingNode
    // node.parent.backingNode instanceof AudioNode
  ) {
    oscGain.connect(node.parent.backingNode as any as IAudioNode<AudioContext>);
  }

  if (node.props.modSources?.gain && node.props.modSources.gain.length > 0) {
    oscGain.gain.value = 0;
    node.props.modSources.gain.forEach((modulatorKey) => {
      const modulator = findNode(modulatorKey);
      if (modulator && modulator.type === "adsr") {
        const gainEnvNode = buildADSRNode(
          context,
          modulator,
          startTime,
          endTime,
        );
        gainEnvNode.connect(oscGain.gain);
        oscStopTime += modulator.props.release;
      } else {
        throw new Error("Failed to build modulator");
      }
    });
  }
  oscNode.stop(oscStopTime);
  return oscNode;
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
