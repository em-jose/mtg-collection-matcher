import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { CardPrice } from "@types";

interface CardImageProps {
  cardName: string;
  prices: Map<string, CardPrice>;
  children: React.ReactNode;
}

export function CardImage({ cardName, prices, children }: CardImageProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const price = prices.get(cardName.toLowerCase());
  const imageUrl = price?.imageUrl;

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Calculate position: show above if enough space, otherwise below
  const getStyle = (): React.CSSProperties => {
    if (!tooltip) return {};
    const imgHeight = 500;
    const showAbove = tooltip.y > imgHeight + 20;

    return {
      position: "fixed",
      left: `${Math.min(Math.max(tooltip.x, 200), window.innerWidth - 200)}px`,
      ...(showAbove
        ? {
            top: `${tooltip.y - 8}px`,
            transform: "translateX(-50%) translateY(-100%)",
          }
        : { top: `${tooltip.y + 28}px`, transform: "translateX(-50%)" }),
      zIndex: 9999,
      pointerEvents: "none" as const,
    };
  };

  return (
    <span
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {tooltip &&
        imageUrl &&
        createPortal(
          <div style={getStyle()}>
            <img
              src={imageUrl}
              alt={cardName}
              style={{ width: "340px" }}
              className="rounded-xl shadow-2xl shadow-black/50 border-2 border-gray-600"
            />
          </div>,
          document.body,
        )}
    </span>
  );
}
