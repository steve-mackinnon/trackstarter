import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface XYPadProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  onChange?: (position: { x: number; y: number }) => void;
  borderColor: string;
}

const NODE_DIAMETER = 22;

export function XYPad({
  width = 300,
  height = 300,
  onChange,
  x = 0.5,
  y = 0.5,
  borderColor,
}: XYPadProps) {
  const [position, setPosition] = useState<Position>({
    x,
    y,
  });
  const [dragOriginOffset, setDragOriginOffset] = useState<Position | null>(
    null,
  );
  const isDragging = !!dragOriginOffset;

  const padRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const startNodeDrag = (
    clientX: number,
    clientY: number,
    e: React.BaseSyntheticEvent,
  ) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const offset = { x: clientX - left, y: clientY - top };
    setDragOriginOffset(offset);
    e.preventDefault();
    e.stopPropagation();
  };

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!padRef.current) {
        return;
      }
      const rect = padRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) / (rect.width - NODE_DIAMETER);
      const y = (clientY - rect.top) / (rect.height - NODE_DIAMETER);

      const clampedX = Math.max(0, Math.min(1, x));
      const clampedY = Math.max(0, Math.min(1, y));

      setPosition({ x: clampedX, y: clampedY });

      if (onChange) {
        onChange({ x: clampedX, y: clampedY });
      }
    },
    [padRef, onChange],
  );

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !padRef.current) {
        return;
      }
      updatePosition(
        clientX - dragOriginOffset.x,
        clientY - dragOriginOffset.y,
      );
    };
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setDragOriginOffset(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      setDragOriginOffset(null);
    };

    const handleNodeTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!nodeRef.current) {
        return;
      }
      const { left, top } = nodeRef.current.getBoundingClientRect();
      const offset = {
        x: e.touches[0].clientX - left,
        y: e.touches[0].clientY - top,
      };
      setDragOriginOffset(offset);
      e.preventDefault();
    };

    const handlePadTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      updatePosition(
        e.touches[0].clientX - NODE_DIAMETER / 2,
        e.touches[0].clientY - NODE_DIAMETER / 2,
      );
      setDragOriginOffset({ x: NODE_DIAMETER / 2, y: NODE_DIAMETER / 2 });
    };

    if (nodeRef.current) {
      nodeRef.current.addEventListener("touchstart", handleNodeTouchStart, {
        passive: false,
      });
    }
    if (padRef.current) {
      padRef.current.addEventListener("touchstart", handlePadTouchStart, {
        passive: false,
      });
    }

    const removeDocumentListeners = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    } else {
      removeDocumentListeners();
    }

    return () => {
      removeDocumentListeners();
      if (nodeRef.current) {
        nodeRef.current.removeEventListener("touchstart", handleNodeTouchStart);
      }
      if (padRef.current) {
        padRef.current.removeEventListener("touchstart", handlePadTouchStart);
      }
    };
  }, [isDragging, onChange, updatePosition, dragOriginOffset]);

  const nodeWidthPercentage = padRef.current
    ? (NODE_DIAMETER / padRef.current.getBoundingClientRect().width) * 100
    : 10;
  const nodeHeightPercentage = padRef.current
    ? (NODE_DIAMETER / padRef.current.getBoundingClientRect().height) * 100
    : 10;
  return (
    <div
      ref={padRef}
      className="relative bg-primary-foreground border-2 rounded-xl"
      style={{ width, height, borderColor: borderColor }}
      onMouseDown={(e) => {
        updatePosition(
          e.clientX - NODE_DIAMETER / 2,
          e.clientY - NODE_DIAMETER / 2,
        );
        setDragOriginOffset({ x: NODE_DIAMETER / 2, y: NODE_DIAMETER / 2 });
      }}
    >
      <div
        ref={nodeRef}
        className="absolute hover:bg-slate-700 active:bg-primary border-primary border-2 rounded-full"
        style={{
          width: NODE_DIAMETER,
          height: NODE_DIAMETER,
          left: `${
            nodeWidthPercentage + position.x * (100 - nodeWidthPercentage)
          }%`,
          top: `${
            nodeHeightPercentage + position.y * (100 - nodeHeightPercentage)
          }%`,
          transformOrigin: "top left",
          transform: "translate(-100%, -100%)",
        }}
        onMouseDown={(e) => startNodeDrag(e.clientX, e.clientY, e)}
      />
    </div>
  );
}
