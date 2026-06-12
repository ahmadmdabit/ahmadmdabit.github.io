import { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface UseAutoScrollOptions {
  /** Distance from bottom (in px) to consider "at bottom" */
  threshold?: number;
  /** Dependency array - when these change, attempt to scroll to bottom */
  deps?: unknown[];
}

/**
 * Hook to manage auto-scroll behavior for chat-like interfaces.
 * - Tracks if user has manually scrolled up
 * - Auto-scrolls to bottom when deps change, unless user scrolled up
 * - Provides refs for scroll container and bottom anchor
 */
export const useAutoScroll = (options: UseAutoScrollOptions = {}) => {
  const { threshold = 80, deps = [] } = options;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // Track manual scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsUserScrolledUp(distanceFromBottom > threshold);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [threshold]); // setIsUserScrolledUp is stable (useState setter) - not needed in deps

  // Auto-scroll when dependencies change (e.g., new messages)
  useEffect(() => {
    if (!isUserScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [deps, isUserScrolledUp]);

  /** Manually reset the "user scrolled up" flag (e.g., on new user message) */
  const resetScrollFlag = useCallback(() => {
    setIsUserScrolledUp(false);
  }, []);

  /** Manually trigger scroll to bottom */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsUserScrolledUp(false);
  }, []);

  // Memoize only the stable callbacks — isUserScrolledUp is intentionally
  // returned fresh so consumers can read it for conditional rendering.
  // Splitting prevents the entire object identity from changing on every
  // scroll-triggered state update (avoids cascading re-renders in parents).
  const stableActions = useMemo(
    () => ({ resetScrollFlag, scrollToBottom }),
    [resetScrollFlag, scrollToBottom],
  );

  return { scrollContainerRef, bottomRef, isUserScrolledUp, ...stableActions };
};
