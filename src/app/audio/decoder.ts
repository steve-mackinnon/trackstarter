import { AudioContext } from "standardized-audio-context";

export async function createBufferFromFile(
  context: AudioContext,
  filename: string,
): Promise<AudioBuffer> {
  const file = await fetch(filename);
  const buffer = await file.arrayBuffer();

  const decoded = await context.decodeAudioData(buffer);
  return decoded;
}
