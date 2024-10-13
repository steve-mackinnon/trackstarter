import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { useSetAtom } from "jotai";
import { MessageSquareText } from "lucide-react";
import { chatVisibleAtom } from "state";

export function ChatToggleButton({ className }: { className: string }) {
  const setChatVisible = useSetAtom(chatVisibleAtom);
  return (
    <Button
      className={cn("rounded-full", className)}
      onClick={() => setChatVisible(true)}
    >
      <MessageSquareText />
    </Button>
  );
}
