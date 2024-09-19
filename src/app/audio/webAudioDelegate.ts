import {
  AudioContext,
  AudioWorkletNode,
  IAudioContext,
  IAudioNode,
} from "standardized-audio-context";
import { ADSR } from "./adsr";
import { AudioGraphDelegate } from "./graph";
import { Sequencer } from "./sequencer";
import { ADSRNode, Node, OscNode } from "./webAudioNodes";

const BPM = 160;

export class WebAudioDelegate implements AudioGraphDelegate {
  private context = new AudioContext();

  createNode(type: string, findNode: (key: string) => Node | null) {
    switch (type) {
      case "osc": {
        // Osc nodes are created dynamically when they are triggered by a sequence
        return null;
      }
      case "filter": {
        return context.createBiquadFilter();
      }
      case "destination":
        return context.destination;
      case "mul":
        return context.createGain();
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
        return new Sequencer(
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
      }
    }
  }

  deleteNode(node: Node) {}

  updateNode(node: Node) {}

  connectNodes(src: Node | string, dest: Node | string) {}
}

export function buildOscNode(
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
