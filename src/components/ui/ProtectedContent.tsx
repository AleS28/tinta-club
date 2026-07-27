"use client";

import { ReactNode, useCallback, useEffect } from "react";

interface ProtectedContentProps {
  children: ReactNode;
  className?: string;
  /** Bloquea atajos de teclado de copia e inspección mientras el componente está montado. */
  blockKeyboard?: boolean;
}

function shouldBlockKeyboardShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;

  if (key === "f12") return true;

  if (modifier && event.shiftKey && (key === "i" || key === "j" || key === "c")) {
    return true;
  }

  if (event.metaKey && event.altKey && key === "i") return true;

  if (modifier && (key === "c" || key === "x" || key === "a" || key === "u" || key === "s")) {
    return true;
  }

  return false;
}

export function ProtectedContent({
  children,
  className = "",
  blockKeyboard = false,
}: ProtectedContentProps) {
  const blockEvent = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (!blockKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldBlockKeyboardShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [blockKeyboard]);

  return (
    <div
      className={`protected-content select-none ${className}`}
      onCopy={blockEvent}
      onCut={blockEvent}
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
    >
      {children}
    </div>
  );
}
