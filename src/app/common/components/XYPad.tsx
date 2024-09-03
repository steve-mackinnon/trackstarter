import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface XYPadProps {
  width?: number;
  height?: number;
  onChange?: (position: { x: number; y: number }) => void;
}

const NODE_DIAMETER = 22;

export function XYPad({ width = 300, height = 300, onChange }: XYPadProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  });
  const [dragOriginOffset, setDragOriginOffset] = useState<Position | null>(
    null,
  );
  const isDragging = !!dragOriginOffset;

  const padRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const offset = { x: e.clientX - left, y: e.clientY - top };
    setDragOriginOffset(offset);
    console.log(`offset ${offset.x} ${offset.y}`);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleNodeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const { x, y } = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e.touches[0];
    setDragOriginOffset({
      x: clientX + x,
      y: clientY + y,
    });
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
        onChange({ x: normalizedX, y: 1 - normalizedY });
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
      className="relative bg-primary-foreground"
      style={{ width, height }}
      onMouseDown={(e) => {
        updatePosition(
          e.clientX - NODE_DIAMETER / 2,
          e.clientY - NODE_DIAMETER / 2,
        );
        setDragOriginOffset({ x: NODE_DIAMETER / 2, y: NODE_DIAMETER / 2 });
      }}
      onTouchStart={(e) => {
        updatePosition(
          e.touches[0].clientX - NODE_DIAMETER / 2,
          e.touches[0].clientY - NODE_DIAMETER / 2,
        );
        setDragOriginOffset({ x: NODE_DIAMETER / 2, y: NODE_DIAMETER / 2 });
      }}
    >
      <div
        className="absolute bg-primary rounded-full"
        style={{
          width: NODE_DIAMETER,
          height: NODE_DIAMETER,
          left: `${position.x * (100 - 0 * 100)}%`,
          top: `${position.y * (100 - 0 * 100)}%`,
          transformOrigin: "top left",
        }}
        onMouseDown={handleNodeMouseDown}
        onTouchStart={handleNodeTouchStart}
      />
    </div>
  );
}
