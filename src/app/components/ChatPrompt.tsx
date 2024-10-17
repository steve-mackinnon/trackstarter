"use client";

import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useApplyStateFromChatResponse } from "hooks/useApplyStateFromChatResponse";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import { paramStateSchema } from "paramsSchema";
import { useState } from "react";
import LoadingIndicator from "react-spinners/CircleLoader";
import { chatVisibleAtom } from "state";

type ResponseStatus = "idle" | "pending" | "error" | "success";

export function ChatPrompt({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>("idle");
  const [responseContent, setResponseContent] = useState("");
  const [chatVisible, setChatVisible] = useAtom(chatVisibleAtom);

  const applyState = useApplyStateFromChatResponse();

  if (!chatVisible) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseStatus("pending");
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
    });
    if (response.ok) {
      setResponseStatus("success");
      const content = paramStateSchema.safeParse(await response.json());
      if (content.success) {
        applyState(content.data);
      } else {
        setResponseStatus("error");
        setResponseContent("parse error");
      }
    } else {
      setResponseStatus("error");
      setResponseContent("");
    }
  };
  const loading = responseStatus === "pending";
  return (
    <div
      className={cn(
        "absolute flex flex-col justify-center items-center bg-slate-950 border-slate-300 border-2 rounded-xl max-w-[500px] w-[90%] p-4 z-50",
        className,
      )}
    >
      <form
        className="w-full pt-10 flex flex-col justify-center items-center gap-y-4 relative"
        onSubmit={handleSubmit}
      >
        <label htmlFor="prompt">What would you like to hear?</label>
        <input
          name="prompt"
          id="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-slate-900 w-full rounded-xl"
        />
        <Button type="submit" disabled={loading || input.length === 0}>
          Submit
        </Button>
        {loading && (
          <div className="absolute right-1 bottom-1">
            <LoadingIndicator size={36} color="white" />
          </div>
        )}
      </form>
      <div>{responseContent}</div>
      <Button
        className="absolute top-2 right-2 p-2 rounded-full"
        variant="ghost"
        onClick={() => setChatVisible(false)}
      >
        <X />
      </Button>
    </div>
  );
}
