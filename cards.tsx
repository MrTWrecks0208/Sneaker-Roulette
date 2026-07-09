// Converted to TypeScript TSX (rename file extension from .js/.jsx to .tsx)
// This replaces direct DOM event listeners with React-friendly typed handlers.

import React, { useCallback } from "react";

interface TooltipHandlersProps {
  tooltipId?: string; // default: "tooltip-1"
}

export default function TooltipHandlers({
  tooltipId = "tooltip-1",
}: TooltipHandlersProps): React.ReactElement {
  const myFunction = useCallback((): void => {
    const el = document.getElementById(tooltipId) as HTMLElement | null;
    if (!el) return;

    el.style.visibility = "visible";
    console.log("function ran");
  }, [tooltipId]);

  const myNextFunction = useCallback((): void => {
    const el = document.getElementById(tooltipId) as HTMLElement | null;
    if (!el) return;

    // Note: original code used display="hidden" which is not a valid CSS value.
    // Keeping intent by switching visibility off.
    el.style.visibility = "hidden";
  }, [tooltipId]);

  return (
    <div
      id={tooltipId}
      onMouseMove={myFunction}
      onMouseOut={myNextFunction}
      style={{ visibility: "hidden" }}
    >
      {/* Tooltip content */}
    </div>
  );
}