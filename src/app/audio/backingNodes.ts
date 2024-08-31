import { ADSR } from "./adsr";
import { ADSRNode, findNodeWithKey, Node, OscNode } from "./audioGraph";

export function buildOscNode(
  context: AudioContext,
  node: OscNode,
  freq: number,
  startTime: number,
  endTime: number,
): OscillatorNode {
  const oscNode = new OscillatorNode(context);
  const oscType = node.props.type;
  oscNode.type = oscType;
  oscNode.frequency.value = freq;
  oscNode.start(startTime);
  oscNode.stop(endTime);

  const oscGain = new GainNode(context);
  oscNode.connect(oscGain);
  if (
    node.parent?.backingNode &&
    node.parent.backingNode instanceof AudioNode
  ) {
    oscGain.connect(node.parent.backingNode);
  }

  if (node.props.modSources?.gain && node.props.modSources.gain.length > 0) {
    oscGain.gain.value = 0;
    node.props.modSources.gain.forEach((modulatorKey) => {
      const modulator = findNodeWithKey(getRoot(node), modulatorKey);
      if (modulator && modulator.type === "adsr") {
        const gainEnvNode = buildADSRNode(
          context,
          modulator,
          startTime,
          endTime,
        );
        gainEnvNode.connect(oscGain.gain);
      }
    });
  }
  return oscNode;
}

function getRoot(node: Node) {
  if (node.parent) {
    return getRoot(node.parent);
  }
  return node;
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
