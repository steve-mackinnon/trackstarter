import { useCreateNodeConnection } from "common/hooks/useCreateNodeConnection";
import { useAtom, useSetAtom } from "jotai";
import { Cable } from "lucide-react";
import { connectionSourceNodeAtom, cursorModeAtom } from "state";

export function NodeConnectionPort({ nodeId }: { nodeId: string }) {
  const setCursorMode = useSetAtom(cursorModeAtom);
  const [connectionSourceNode, setConnectionSourceNode] = useAtom(
    connectionSourceNodeAtom
  );
  const createNodeConnection = useCreateNodeConnection();

  return (
    <div
      className="h-8 w-10 rounded-xl hover:bg-slate-300 mt-4 flex items-center justify-center"
      onClick={() => {
        if (connectionSourceNode) {
          createNodeConnection(nodeId);
        } else {
          setCursorMode("add-connection");
          setConnectionSourceNode(nodeId);
        }
      }}
    >
      <Cable />
    </div>
  );
}
