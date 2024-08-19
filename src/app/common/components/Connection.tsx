import { useAtomValue } from "jotai";
import { nodePositionsAtom } from "state";

export function Connection({ source, dest }: { source: string; dest: string }) {
  const nodePositions = useAtomValue(nodePositionsAtom);

  const sourcePos = nodePositions[source];
  const destPos = nodePositions[dest];

  if (!sourcePos || !destPos) {
    return null;
  }

  const curveXOffset = destPos.x - sourcePos.x;
  return (
    <svg className="absolute w-full h-full pointer-events-none">
      <path
        d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + curveXOffset} ${
          sourcePos.y
        }, ${destPos.x - curveXOffset} ${destPos.y}, ${destPos.x} ${destPos.y}`}
        stroke="white"
        strokeWidth="2px"
        fill="transparent"
      />
    </svg>
  );
}
