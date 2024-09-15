import {
  AudioContext,
  IAudioContext,
  IAudioNode,
  OscillatorNode,
} from "standardized-audio-context";
import { ADSR } from "./adsr";
import { ADSRNode, findNodeWithKey, Node, OscNode } from "./audioGraph";

export function buildOscNode(
  context: IAudioContext,
  node: OscNode,
  freq: number,
  startTime: number,
  endTime: number,
  root: Node,
): OscillatorNode<AudioContext> {
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
    oscGain.connect(node.parent.backingNode as IAudioNode<AudioContext>);
  }

  if (node.props.modSources?.gain && node.props.modSources.gain.length > 0) {
    oscGain.gain.value = 0;
    node.props.modSources.gain.forEach((modulatorKey) => {
      const modulator = findNodeWithKey(root, modulatorKey);
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
  context: AudioContext,
  node: ADSRNode,
  startTime: number,
  endTime: number,
) {
  const adsrNode = new ADSR(context, node.props);
  adsrNode.trigger(startTime, endTime);
  return adsrNode;
}
