"use client";

import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useApplyStateFromChatResponse } from "hooks/useApplyStateFromChatResponse";
import { useAtom } from "jotai";
import { Ban, Check, Trash2, X } from "lucide-react";
import { paramStateSchema } from "paramsSchema";
import { useState } from "react";
import LoadingIndicator from "react-spinners/CircleLoader";
import { chatStateAtom, chatVisibleAtom } from "state";

type ResponseStatus = "idle" | "pending" | "error" | "success";

export function ChatPrompt({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>("idle");
  const [responseContent, setResponseContent] = useState("");
  const [chatVisible, setChatVisible] = useAtom(chatVisibleAtom);
  const [chatState, setChatState] = useAtom(chatStateAtom);

  const applyState = useApplyStateFromChatResponse();

  if (!chatVisible) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseStatus("pending");
    setChatState((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [...chatState, { role: "user", content: input }],
      }),
    });
    try {
      if (!response.ok) {
        throw new Error("Bad response");
      }
      setResponseStatus("success");
      const content = paramStateSchema.safeParse(await response.json());
      if (content.success) {
        applyState(content.data);
        setChatState((prev) => [
          ...prev,
          { role: "assistant", content: JSON.stringify(content.data) },
        ]);
      }
    } catch (e) {
      setResponseStatus("error");
      setResponseContent("parse error");
      const lastMessage = chatState[chatState.length - 1];
      setChatState((prev) => prev.slice(0, -1));
      setInput(lastMessage.content as string);
    }
  };
  const loading = responseStatus === "pending";
  const success = responseStatus === "success";
  const error = responseStatus === "error";
  return (
    <div
      className={cn(
        "absolute flex flex-col justify-center items-center bg-slate-950 border-slate-300 border-2 rounded-xl max-w-[500px] w-[90%] p-4 z-50 overflow-auto overflow-y-scroll max-h-[90vh]",
        className,
      )}
    >
      <label htmlFor="prompt">What would you like to hear?</label>
      <div className="w-full flex flex-col gap-y-4">
        {chatState.map((message, index) => (
          <div key={index}>
            <div className="font-bold">{message.role}: </div>
            <div>
              {message.role !== "user"
                ? "New settings"
                : (message.content as string)}
            </div>
          </div>
        ))}
      </div>
      <form
        className="w-full pt-10 flex flex-col justify-center items-center gap-y-4 relative"
        onSubmit={handleSubmit}
      >
        <input
          name="prompt"
          id="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-slate-900 w-full rounded-xl p-2 h-10"
        />
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              setChatState([]);
            }}
          >
            <Trash2 />
          </Button>
          <Button type="submit" disabled={loading || input.length === 0}>
            Submit
          </Button>
          <div className="w-[56px]"></div>
        </div>
        {loading && (
          <div className="absolute right-1 bottom-1">
            <LoadingIndicator size={36} color="white" />
          </div>
        )}
        {success && (
          <div className="absolute right-1 bottom-1">
            <Check />
          </div>
        )}
        {error && (
          <div className="absolute right-1 bottom-1">
            <Ban color="red" />
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
