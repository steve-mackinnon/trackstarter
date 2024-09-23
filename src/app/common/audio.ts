import { createBufferFromFile } from "audio/decoder";
import { AudioGraph } from "audio/graph";
import { unmute } from "audio/unmute";
import { WebAudioDelegate } from "audio/webAudioDelegate";
import { AudioContext } from "standardized-audio-context";

const context = new AudioContext();
unmute(context, false, false);
export const audioGraph = new AudioGraph(new WebAudioDelegate(context));

const loadAudioFile = async (file: string, id: string) => {
  const buffer = await createBufferFromFile(context, file);
  audioGraph.addSample(id, buffer);
};

const loadAudioFiles = async () => {
  await Promise.all([
    loadAudioFile("audio/kick.wav", "kick"),
    loadAudioFile("audio/snare.wav", "snare"),
    loadAudioFile("audio/ch.wav", "closed-hh"),
  ]);
};
loadAudioFiles();
