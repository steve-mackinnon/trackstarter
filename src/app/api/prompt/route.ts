import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

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

  const model = anthropic("claude-3-5-sonnet-20240620");
  const { text } = await generateText({ model, prompt });
  return Response.json({ message: text });
}
