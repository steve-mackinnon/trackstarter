import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { paramStateSchema } from "paramsSchema";
// Only include scales with seven notes, but feel free to use more esoteric scales in order to match the requested mood.
const SYSTEM_PROMPT = `
You are a music production assistant for an app that contains two synthesizers: one plays a chord progression, one plays an accompanying melody. Each synth includes a single sine, triangle, saw or square wave oscillator. The synthesizers also include low pass filters with adjustable frequency and Q. Each synth includes an ADSR envelope for the signal amplitude. Additionally, LFO parameters can be specified to modulate the oscillator frequency and filter frequency.

Given a prompt describing a desired vibe for a song, please respond with parameters for both synthesizers in JSON to match the prompt. Additionally, include an eight chord progression, scale name and root note without an octave (e.g. C). Include a melody that will be played across four bars. Each melody step represents a 16th note, and are 0-indexed. Melody steps include the start and end step plus the note including the octave (e.g. C#4).

Format the chord progression using numbers representing the scale degree of the root note separated by dashes, and use "b" to represent a flattened root note (e.g. 1-4-b5-2-1-3-5-4).
`;
//Note: the melody will be generated by google magenta based on the chord progression you provide.
interface PromptRequest {
  prompt: string;
}

export async function POST(request: Request) {
  const { prompt }: PromptRequest = await request.json();
  if (!prompt) {
    return new Response(null, {
      status: 400,
      statusText: "Request was missing `prompt` field",
    });
  } else if (typeof prompt !== "string") {
    return new Response(null, {
      status: 400,
      statusText: "`prompt` field must be a string",
    });
  }
  if (prompt.length > 1000) {
    return new Response(null, {
      status: 400,
      statusText: "prompt length must be < 1000",
    });
  }

  try {
    const model = anthropic("claude-3-5-sonnet-20240620");
    const { object } = await generateObject({
      model,
      schema: paramStateSchema,
      system: SYSTEM_PROMPT,
      prompt: prompt,
    });
    return Response.json(object);
  } catch (e) {
    console.error(e);
    return new Response((e as any).message, { status: 500 });
  }
}