import { useRef, useCallback, useState, useEffect } from "react";
import puter from "@heyputer/puter.js";
import type { UsageInfo, CompactionJob } from "../types/Chat.types";
import type { ChatOptions } from "@heyputer/puter.js/types/modules/ai";
import {
  CompactionThresholdRatio,
  CompactionMaxRetries,
  CompactionRetryBaseDelayMs,
} from "@/constants/chat";

interface UseCompactionCallbacks {
  /** Called when compaction succeeds with the compacted history */
  onSuccess: (
    compacted: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    originalHistory: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    tokenUsage: UsageInfo,
  ) => void;
  /** Called when compaction fails after all retries */
  onFailure: (
    error: Error,
    originalHistory: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ) => void;
}

interface UseCompactionOptions {
  /** LLM model to use for compaction */
  model: string;
  /** Context window size in tokens */
  contextWindow: number;
  /** Threshold ratio (0-1) to trigger compaction */
  thresholdRatio?: number;
  /** Max retry attempts for failed compaction */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  retryBaseDelayMs?: number;
  /** Callbacks for compaction completion/failure */
  callbacks: UseCompactionCallbacks;
}

interface UseCompactionReturn {
  /** Whether compaction is currently in progress */
  isHistorySummarizing: boolean;
  /** Enqueue a compaction job if threshold exceeded */
  checkAndEnqueueCompaction: (
    history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    tokenUsage: UsageInfo,
  ) => void;
  /** Abort any in-progress compaction */
  abortCompaction: () => void;
}

/**
 * Hook to manage background conversation compaction with retry queue.
 * - Monitors token usage and triggers compaction when threshold exceeded
 * - Processes compaction jobs sequentially with exponential backoff
 * - Provides abort capability
 * - Calls back to consumer with compacted history or error
 */
export const useCompaction = (options: UseCompactionOptions): UseCompactionReturn => {
  const {
    model,
    contextWindow,
    thresholdRatio = CompactionThresholdRatio,
    maxRetries = CompactionMaxRetries,
    retryBaseDelayMs = CompactionRetryBaseDelayMs,
    callbacks,
  } = options;

  const [isHistorySummarizing, setIsHistorySummarizing] = useState(false);

  const compactionQueueRef = useRef<CompactionJob[]>([]);
  const isHistorySummarizingRef = useRef(false);
  const compactionAbortControllerRef = useRef<AbortController | null>(null);

  // Refs for dynamic options to avoid stale closures and unnecessary effect re-runs
  const maxRetriesRef = useRef(maxRetries);
  const retryBaseDelayMsRef = useRef(retryBaseDelayMs);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    maxRetriesRef.current = maxRetries;
  }, [maxRetries]);

  useEffect(() => {
    retryBaseDelayMsRef.current = retryBaseDelayMs;
  }, [retryBaseDelayMs]);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Build compaction prompt
  const buildCompactionPrompt = useCallback(
    (history: Array<{ role: "user" | "assistant" | "system"; content: string }>): string => {
      const conversationText = history.map((m) => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n");

      return `You are a professional conversation summarizer. Your objective is to produce a concise, factual summary of the provided conversation history.

## 1. STRICT CONSTRAINTS
- **Extraction Only:** Do not alter proper nouns (e.g., cities, names).
- **No Upgrading:** Do not upgrade listed skills into project experience.
- **Preserve Gaps:** Preserve explicit capability gaps (e.g., 'not explicitly mentioned').
- **No Tables:** Format all structured data using vertical bulleted lists.
- **Zero Fabrication:** Summarize ONLY the factual information presented.

## 2. REQUIRED OUTPUT STRUCTURE
Organize the summary using the following plain-text/bulleted sections if the data is present in the text:
- **Current Role & Status:** (Brief statement of current position and location).
- **Employment History:** (Bulleted list of companies, roles, and dates).
- **Key Projects & Technologies:** (Bulleted list of named projects and their associated tech stacks).
- **Documented Capabilities:** (Specific skills or capabilities explicitly proven in the text).

CONVERSATION HISTORY:
${conversationText}

SUMMARY:`;
    },
    [],
  );

  // Compact history with LLM
  const compactHistoryWithLLM = useCallback(
    async (
      history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
      signal: AbortSignal,
    ): Promise<Array<{ role: "user" | "assistant" | "system"; content: string }>> => {
      const prompt = buildCompactionPrompt(history);

      try {
        const response = await puter.ai.chat(
          [
            {
              role: "system",
              content:
                "You are a professional conversation summarizer. Produce a concise factual summary preserving all specific details about the candidate's experience, projects, and skills.",
            },
            { role: "user", content: prompt },
          ],
          {
            model,
            signal,
          } as ChatOptions,
        );

        const summaryText = typeof response === "string" ? response : (response.message?.content as string) ?? "";

        if (!summaryText || summaryText.trim().length === 0) {
          throw new Error("Empty summary returned from LLM");
        }

        const recentTurns = history.slice(-2);
        return [
          { role: "system", content: `## PREVIOUS CONTEXT (Summary)\n${summaryText.trim()}` },
          ...recentTurns,
        ];
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        throw new Error(
          `Compaction LLM call failed: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }
    },
    [model, buildCompactionPrompt],
  );

  // Process compaction queue - use ref to avoid memoization issues with recursive async calls
  // Lazy-initialized with no-op to avoid non-null assertion when called
  const processCompactionQueueRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Store the function in ref for stable reference in queueMicrotask
  // Uses refs for options so effect only needs to re-run when compactHistoryWithLLM changes
  useEffect(() => {
    processCompactionQueueRef.current = async () => {
      if (isHistorySummarizingRef.current || compactionQueueRef.current.length === 0) return;

      const job = compactionQueueRef.current[0];
      isHistorySummarizingRef.current = true;
      setIsHistorySummarizing(true);

      const controller = new AbortController();
      compactionAbortControllerRef.current = controller;

      try {
        const compacted = await compactHistoryWithLLM(job.history, controller.signal);
        job.resolve(compacted);
        compactionQueueRef.current.shift();
        // Call success callback with compacted history, original history, and token usage
        callbacksRef.current.onSuccess(compacted, job.history, job.tokenUsage);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          isHistorySummarizingRef.current = false;
          setIsHistorySummarizing(false);
          return;
        }

        job.attempt++;
        if (job.attempt <= maxRetriesRef.current) {
          const delay = retryBaseDelayMsRef.current * Math.pow(2, job.attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          const err = error instanceof Error ? error : new Error(String(error));
          job.reject(err);
          compactionQueueRef.current.shift();
          // Call failure callback with error and original history
          callbacksRef.current.onFailure(err, job.history);
        }
      } finally {
        isHistorySummarizingRef.current = false;
        setIsHistorySummarizing(false);
        if (compactionQueueRef.current.length > 0) {
          queueMicrotask(() => processCompactionQueueRef.current());
        }
      }
    };
  }, [compactHistoryWithLLM]);

  // Check if compaction needed and enqueue
  const checkAndEnqueueCompaction = useCallback(
    (
      history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
      tokenUsage: UsageInfo,
    ) => {
      // Use REAL token usage from completed turns (prompt + input_cache_read)
      const historyTokens = tokenUsage.prompt + tokenUsage.inputCacheRead;
      const threshold = contextWindow * thresholdRatio;

      if (historyTokens > threshold) {
        const job: CompactionJob & { tokenUsage: UsageInfo } = {
          id: Date.now(),
          history,
          tokenUsage,
          resolve: () => {
            // Resolved in processCompactionQueueRef after success
          },
          reject: (error) => {
            // Rejected in processCompactionQueueRef after all retries fail
            console.error("[useCompaction] Compaction failed:", error);
          },
          attempt: 0,
          timestamp: Date.now(),
        };
        compactionQueueRef.current.push(job);
        processCompactionQueueRef.current();
      }
    },
    [contextWindow, thresholdRatio],
  );

  const abortCompaction = useCallback(() => {
    compactionAbortControllerRef.current?.abort();
    compactionQueueRef.current = [];
    isHistorySummarizingRef.current = false;
    setIsHistorySummarizing(false);
  }, []);

  // Return object is stable: checkAndEnqueueCompaction and abortCompaction are
  // useCallback-stable, and isHistorySummarizing is a primitive.
  // React Compiler (production-ready in React 19) auto-memoizes this.
  return { isHistorySummarizing, checkAndEnqueueCompaction, abortCompaction };
};
