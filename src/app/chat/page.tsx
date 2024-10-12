"use client";

import { useState } from "react";

type ResponseStatus = "idle" | "pending" | "error" | "success";

export default function Chat() {
  const [input, setInput] = useState("");
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>("idle");
  const [responseContent, setResponseContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseStatus("pending");
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
    });
    if (response.ok) {
      setResponseStatus("success");
      const content = await response.json();
      setResponseContent(JSON.stringify(content));
    } else {
      setResponseStatus("error");
      setResponseContent("");
    }
  };
  return (
    <>
      <div>{responseStatus}</div>
      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <div>{responseContent}</div>
    </>
  );
}
