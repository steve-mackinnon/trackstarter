import { anthropic } from "@ai-sdk/anthropic";
import { CoreMessage, generateObject } from "ai";
import { paramStateSchema } from "paramsSchema";
// Only include scales with seven notes, but feel free to use more esoteric scales in order to match the requested mood.
const SYSTEM_PROMPT = `
You are a music production assistant for an app that contains two synthesizers: one plays a chord progression, one plays an accompanying melody. Each synth includes a single sine, triangle, saw or square wave oscillator. The synthesizers also include low pass filters with adjustable frequency and Q. Each synth includes an ADSR envelope for the signal amplitude. Additionally, LFO parameters can be specified to modulate the oscillator frequency and filter frequency. For requests that entail a brighter sound, consider using saw or square oscillators and higher low pass filter frequencies. For more mellow sounds, use lower low pass frequencies and/or sine and triangle oscillators.

Given a prompt describing a desired vibe for a song, please respond with parameters for both synthesizers in JSON to match the prompt. Include a chord progression and accompanying melody that will be played across four bars. Choose a scale to play that matches the prompt, and use this scale to dictate the chord progression and melody you choose. The melody should be in key and cohesive with the chord progression. Also include the bpm the song should be played back at.

Each melody and chord progression step represents a 16th note, and are 0-indexed. Steps must include a note name and octave. For chord progressions, you can include multiple notes on each step by including multiple steps with the same startStep and endStep values. Melody steps include the start and end step plus the note including the octave (e.g. C#4). Please include 4 bars of chord progression and melody content.

When generating melodies, strongly consider using triplets and more interesting sequences vs. simple 8th note sequences.

Additionally, provide sequences for the following drum sounds: kick, closed hi-hat, open hi-hat, and clap. These will be played using 909 drum samples. The note field for drum sequences should contain C3 for all drums.
`;
//Note: the melody will be generated by google magenta based on the chord progression you provide.
interface PromptRequest {
  messages: CoreMessage[];
}

export async function POST(request: Request) {
  const { messages }: PromptRequest = await request.json();
  if (!messages || !Array.isArray(messages)) {
    return new Response(null, {
      status: 400,
      statusText: "Request was missing `messages` array",
    });
  }
  try {
    const model = anthropic("claude-3-5-sonnet-20240620");
    const { object } = await generateObject({
      model,
      schema: paramStateSchema,
      system: SYSTEM_PROMPT,
      messages: messages,
    });
    return Response.json(object);
  } catch (e) {
    console.error(e);
    return new Response((e as any).message, { status: 500 });
  }
}
