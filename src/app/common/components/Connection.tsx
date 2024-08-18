import { useAtomValue } from "jotai";
import { nodesAtom } from "state";

export function Connection({ source, dest }: { source: string; dest: string }) {
  const nodes = useAtomValue(nodesAtom);

  const sourceNode = nodes.find((n) => n.id === source);
  const destNode = nodes.find((n) => n.id === dest);

  if (!sourceNode || !destNode) {
    return null;
  }
  return (
    <svg className="absolute w-full h-full pointer-events-none">
      <line
        x1={sourceNode.x}
        y1={sourceNode.y}
        x2={destNode.x}
        y2={destNode.y}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}
