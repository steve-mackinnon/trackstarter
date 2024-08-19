import { useSetAtom } from "jotai";
import { PropsWithChildren, useEffect, useState } from "react";
import { setNodePositionAtom } from "state";
import { NodeConnectionPort } from "./NodeConnectionPort";
interface DragState {
  xOffset: number;
  yOffset: number;
}

export interface DraggableContainerProps {
  x: number;
  y: number;
  label: string;
  hasConnectionPort: boolean;
  nodeId: string;
}

export function DraggableContainer({
  x,
  y,
  label,
  hasConnectionPort,
  children,
  nodeId,
}: PropsWithChildren<DraggableContainerProps>) {
  const [pos, setPos] = useState({ x, y });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const setNodePosition = useSetAtom(setNodePositionAtom);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      if (dragState) {
        setPos({
          x: e.clientX - dragState.xOffset,
          y: e.clientY - dragState.yOffset,
        });
      }
    };
    window.addEventListener("mousemove", mouseMove);
    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, [dragState, setDragState, setPos]);

  useEffect(() => {
    const mouseUp = (e: any) => {
      e.stopPropagation();
      setDragState(null);
      setNodePosition({ key: nodeId, x: pos.x, y: pos.y });
    };
    window.addEventListener("mouseup", mouseUp);

    return () => {
      window.removeEventListener("mouseup", mouseUp);
    };
  }, [pos]);

  const getBorderColor = () => {
    if (dragState) {
      return "white";
    } else if (isMouseOver) {
      return "yellow";
    }
    return "transparent";
  };
  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: "200px",
        border: `2px solid ${getBorderColor()}`,
        boxSizing: "border-box",
        background: isMouseOver ? "darkturquoise" : "slategray",
      }}
      className={`absolute flex flex-col bg-gray-500 pb-2 items-center rounded-2xl`}
      onMouseDown={(e) => {
        e.stopPropagation();
        setDragState({
          xOffset: e.clientX - pos.x,
          yOffset: e.clientY - pos.y,
        });
      }}
      onMouseUp={() => setDragState(null)}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <label className="pb-1 select-none font-bold">{label}</label>
      {children}
      {hasConnectionPort && <NodeConnectionPort nodeId={nodeId} />}
    </div>
  );
}
