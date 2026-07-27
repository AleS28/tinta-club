"use client";

import { ReactNode, useCallback, useEffect } from "react";

interface ProtectedContentProps {
  children: ReactNode;
  className?: string;
  /** Bloquea atajos de teclado de copia en toda la ventana mientras el componente está montado. */
  blockKeyboard?: boolean;
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
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && (key === "c" || key === "x" || key === "a" || key === "u")) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [blockKeyboard]);

  return (
    <div
      className={`protected-content ${className}`}
      onCopy={blockEvent}
      onCut={blockEvent}
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
    >
      {children}
    </div>
  );
}
