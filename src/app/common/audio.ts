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
    loadAudioFile("audio/909-kick.mp3", "kick"),
    loadAudioFile("audio/909-clap.mp3", "snare"),
    loadAudioFile("audio/909-ch.mp3", "closed-hh"),
    loadAudioFile("audio/909-oh.mp3", "open-hh"),
    loadAudioFile("audio/909-lt.mp3", "low-tom"),
    loadAudioFile("audio/909-mt.mp3", "mid-tom"),
    loadAudioFile("audio/909-ht.mp3", "high-tom"),
    // loadAudioFile("audio/909-crash.mp3", "crash"),
    loadAudioFile("audio/909-ride.mp3", "ride"),
  ]);
};
loadAudioFiles();
