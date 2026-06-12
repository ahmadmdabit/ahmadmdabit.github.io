import { useEffect, useCallback } from "react";

interface UseKeyboardShortcutsOptions {
  /** Called when Escape key is pressed */
  onEscape?: () => void;
  /** Called when Enter is pressed (without Shift) in the input */
  onEnter?: () => void;
  /** Element to focus when mounted (e.g., input ref) */
  focusRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /** Delay before focusing (ms) */
  focusDelay?: number;
  /** Whether the shortcuts are active */
  enabled?: boolean;
}

/**
 * Hook to manage keyboard shortcuts for chat input.
 * - Escape: close/escape handler
 * - Enter (without Shift): send message
 * - Auto-focus on mount
 * - Respects IME composition
 */
export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const {
    onEscape,
    onEnter,
    focusRef,
    focusDelay = 220,
    enabled = true,
  } = options;

  // Auto-focus on mount
  useEffect(() => {
    if (!enabled || !focusRef?.current) return;

    const timeout = setTimeout(() => {
      focusRef.current?.focus();
    }, focusDelay);

    return () => clearTimeout(timeout);
  }, [enabled, focusRef, focusDelay]);

  // Global Escape handler
  useEffect(() => {
    if (!enabled || !onEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [enabled, onEscape]);

  // Enter key handler for input (respects IME composition)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
      if (!enabled || !onEnter) return;
      if (e.nativeEvent.isComposing) return; // IME composition
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onEnter();
      }
    },
    [enabled, onEnter],
  );

  return { handleKeyDown };
};
