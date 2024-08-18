import { useAtomValue } from "jotai";
import { nodesAtom } from "state";

export function Connection({ source, dest }: { source: string; dest: string }) {
  const nodes = useAtomValue(nodesAtom);

  const sourceNode = nodes.find((n) => n.key === source);
  const destNode = nodes.find((n) => n.key === dest);

  if (!sourceNode || !destNode) {
    return null;
  }

  const curveXOffset = destNode.x - sourceNode.x;
  return (
    <svg className="absolute w-full h-full pointer-events-none">
      <path
        d={`M ${sourceNode.x} ${sourceNode.y} C ${
          sourceNode.x + curveXOffset
        } ${sourceNode.y}, ${destNode.x - curveXOffset} ${destNode.y}, ${
          destNode.x
        } ${destNode.y}`}
        stroke="white"
        strokeWidth="2px"
        fill="transparent"
      />
    </svg>
  );
}
