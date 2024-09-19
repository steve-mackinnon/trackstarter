import { AudioGraph } from "audio/graph";
import { WebAudioDelegate } from "audio/webAudioDelegate";

export const audioGraph = new AudioGraph(new WebAudioDelegate());
