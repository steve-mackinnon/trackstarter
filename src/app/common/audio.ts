import { AudioGraph } from "audio/graph";
import { unmute } from "audio/unmute";
import { WebAudioDelegate } from "audio/webAudioDelegate";
import { AudioContext } from "standardized-audio-context";

const context = new AudioContext();
unmute(context, false, false);
export const audioGraph = new AudioGraph(new WebAudioDelegate(context));
