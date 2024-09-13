import * as Tone from "tone";
import { AudioGraphDelegate } from "./graph";
import { Sequencer } from "./sequencer";
import { Node } from "./webAudioNodes";

export class WebAudioDelegate implements AudioGraphDelegate<Node> {
  createNode(type: string) {
    switch (type) {
      case "osc": {
        // Osc nodes are created dynamically when they are triggered by a sequence
        return null;
      }
      case "filter": {
        return Tone.getContext().createBiquadFilter();
      }
      case "destination":
        return Tone.getContext().rawContext.destination;
      case "mul":
        return Tone.getContext().createGain();
      case "adsr":
        // ADSR nodes are built on the fly when triggered
        return null;
      case "delay":
        return Tone.getContext().createAudioWorkletNode(
          "feedback-delay-processor",
        );
      case "master-clipper":
        return Tone.getContext().createAudioWorkletNode(
          "master-clipper-processor",
        );
      case "sequencer": {
        return new Sequencer(
          node,
          (key) => findNodeWithKey(currentRoot, key),
          (node, freq, startTime, endTime) => {
            if (node.type === "osc") {
              return buildOscNode(
                Tone.getContext(),
                node,
                freq,
                startTime,
                endTime,
                currentRoot as Node,
              );
            }
          },
        );
      }
    }
  }

  deleteNode(node: Node) {}

  updateNode(node: Node) {}

  connectNodes(src: Node | string, dest: Node | string) {}
}
