import { PropsWithChildren, useEffect, useState } from "react";

interface DragState {
  xOffset: number;
  yOffset: number;
}

export function DraggableContainer({
  x,
  y,
  label,
  children,
}: PropsWithChildren<{
  x: number;
  y: number;
  label: string;
}>) {
  const [pos, setPos] = useState({ x, y });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    const mouseUp = (e: any) => {
      e.stopPropagation();
      setDragState(null);
    };
    window.addEventListener("mouseup", mouseUp);

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
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
    };
  }, [dragState, setDragState, setPos]);

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
      className={`absolute flex flex-col bg-gray-500 p-4 items-center rounded-2xl`}
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
      <label className="pb-3 select-none font-bold">{label}</label>
      {children}
    </div>
  );
}
