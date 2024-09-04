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
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      const nodeWidth = NODE_DIAMETER / rect.width;
      const nodeHeight = NODE_DIAMETER / rect.height;
      const normalizedX = Math.max(0, Math.min(1 - nodeWidth, x));
      const normalizedY = Math.max(0, Math.min(1 - nodeHeight, y));

      setPosition({ x: normalizedX, y: normalizedY });

      if (onChange) {
        onChange({ x: normalizedX, y: normalizedY });
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
      e.stopPropagation();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      setDragOriginOffset(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, onChange, updatePosition, dragOriginOffset]);

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
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        updatePosition(
          e.touches[0].clientX - NODE_DIAMETER / 2,
          e.touches[0].clientY - NODE_DIAMETER / 2,
        );
        setDragOriginOffset({ x: NODE_DIAMETER / 2, y: NODE_DIAMETER / 2 });
      }}
    >
      <div
        ref={nodeRef}
        className="absolute bg-primary rounded-full"
        style={{
          width: NODE_DIAMETER,
          height: NODE_DIAMETER,
          left: `${position.x * (100 - 0 * 100)}%`,
          top: `${position.y * (100 - 0 * 100)}%`,
          transformOrigin: "top left",
        }}
        onMouseDown={(e) => startNodeDrag(e.clientX, e.clientY, e)}
        onTouchStart={(e) => {
          e.preventDefault();
          startNodeDrag(e.touches[0].clientX, e.touches[0].clientY, e);
        }}
      />
    </div>
  );
}
