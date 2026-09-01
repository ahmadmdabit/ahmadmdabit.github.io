import puter from "@heyputer/puter.js";
import type { ChatMessage } from "@heyputer/puter.js/types/modules/ai";
import { AvailableLLMModels, LLMModel } from "@/constants/chat";
import type { FallbackModel, FallbackState } from "@/types/Chat.types";

// Fallback state types live in @/types/Chat.types (shared data contracts);
// re-exported here so consumers can keep importing the module's full API
// surface from a single site.
export type { FallbackModel, FallbackState };

// Options for chatWithFallback — a flexible subset of StreamingChatOptions.
// `stream` is normalized by the library: chatCompleteWithFallback strips it
// (non-streaming calls must never request streaming), while
// chatStreamWithFallback always injects `stream: true` — puter.js enables
// streaming ONLY via this option field (its third positional argument is
// `testMode`, not a streaming toggle).
export interface ChatFallbackOptions {
  signal: AbortSignal;
  stream?: boolean;
  verbosity?: string;
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
}

// Extended ChatResponseChunk with tool_use properties.
// This is the element type yielded by chatStreamWithFallback — consumers
// typically infer it from `for await`, so it is rarely imported by name.
export interface ExtendedChatResponseChunk {
  text?: string;
  type?: "tool_use" | "usage" | "reasoning";
  id?: string;
  name?: string;
  input?: { query: string; searchType: string };
  usage?: {
    prompt?: number;
    completion?: number;
    input_cache_read?: number;
  };
}

/** Non-streaming responses: plain string or a message-wrapped object. */
export type ChatCompletionResponse = string | { message?: { content?: string } };

/**
 * Builds the initial fallback state from AvailableLLMModels.
 * The pinned model starts at the exported `LLMModel` constant (not blindly at
 * index 0), so the UI's active model and compaction's threshold math agree
 * with the first model actually attempted.
 */
export function getInitialFallbackState(): FallbackState {
  const models: FallbackModel[] = Object.values(AvailableLLMModels).map((m) => ({
    model: m.model,
    context: m.context,
    isFree: m.isFree,
    order: m.order,
  }));

  const initialIndex = models.findIndex((m) => m.model === LLMModel);
  return {
    models,
    pinnedIndex: initialIndex >= 0 ? initialIndex : 0,
  };
}

/** Returns the currently pinned model entry. */
export function getActiveModel(state: FallbackState): FallbackModel {
  return state.models[state.pinnedIndex];
}

/**
 * Pins a model index for subsequent calls. The ONLY mutation point for state —
 * FallbackState is readonly at the type level, so this cast is the single
 * greppable place where mutation happens.
 */
function pinModel(state: FallbackState, index: number): void {
  (state as { pinnedIndex: number }).pinnedIndex = index;
}

/**
 * Un-pins a model that just proved broken (rate-limited / unavailable).
 * Without this, a persistently failing pinned model is retried FIRST on every
 * subsequent call, burning a round-trip per message before the fallback loop
 * catches up. Advancing the pin to the NEXT model in the current attempt order
 * keeps the "start from the last known attempt" semantics without ever leaving
 * pinnedIndex pointing at a model known to be failing.
 * No-op when the failed index is not the pinned one (a non-pinned attempt
 * failing says nothing about the pinned model's health).
 */
function advancePinOnError(state: FallbackState, failedIndex: number, order: readonly number[]): void {
  if (state.pinnedIndex !== failedIndex) return;
  const next = order[order.indexOf(failedIndex) + 1];
  if (next !== undefined) pinModel(state, next);
}

/**
 * Runtime-proof abort detection. Puter.js (and ModelFallback's re-throws)
 * surface aborts as PLAIN OBJECTS, not Error instances, so `instanceof Error`
 * misclassifies a user abort as a retryable failure. Checks the signal itself
 * first — runtimes/wrappers may re-wrap DOMException aborts and lose the name.
 * Exported so hook-level catch blocks share one implementation instead of
 * triplicated duck-typing.
 */
export function isAbort(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return (error as { name?: string } | null | undefined)?.name === "AbortError";
}

/**
 * Detects the failure shape that puter.js RESOLVES (does not reject) on the
 * HTTP-200 paths: a body like
 *   { error, message, code: "upstream_rate_limited", attempts: [...] }
 * arrives either as a resolved non-streaming value (utils.js line 702 only
 * unwraps `resp.result`; there is no `success: false` field to trigger the
 * reject branch) or as a yielded ndjson stream line. Such an object must be
 * treated as a failure, not pinned as a working model.
 *
 * A real success (after `resp.result` unwrapping) is either a string, or an
 * object whose `message` is an OBJECT ({ role, content }) — the failure body's
 * `message` is a plain error STRING.
 */
export function isErrorShapedResponse(response: unknown): boolean {
  if (!response || typeof response !== "object") return false;
  const r = response as Record<string, unknown>;
  const hasErrorCode = typeof r.code !== "undefined" && (r.error !== undefined || r.attempts !== undefined);
  const messageIsErrorString = typeof r.message === "string" && r.error !== undefined;
  const looksLikeSuccess = typeof r.message === "object" && r.message !== null;
  return (hasErrorCode || messageIsErrorString) && !looksLikeSuccess;
}

/**
 * Determines if an error is transient/model-related and should trigger
 * fallback to the next model. Puter.js throws PLAIN OBJECTS (not Error
 * instances) shaped like the HTTP response body, e.g.:
 *   { error, message, code: "upstream_rate_limited", attempts: [...] }
 * and sometimes wrappers carrying `status`. Classification therefore must
 * be pattern-based, not an exact-match code enum — upstream code strings
 * are namespaced ("upstream_*", "interface_*") and can evolve.
 *
 * Returns false for user aborts, auth errors, and malformed requests
 * (retrying those on another model just wastes calls).
 */
export function isModelError(error: unknown): boolean {
  // Abort: an Error with name AbortError, OR a plain object marked aborted.
  const name = (error as { name?: string })?.name;
  if (name === "AbortError") return false;

  const code = String((error as { code?: string | number })?.code ?? "");
  const status = (error as { status?: number })?.status;
  const message = String((error as { message?: string })?.message ?? (error as { error?: string })?.error ?? "");

  // --- Rate limiting (any namespacing: rate_limited, upstream_rate_limited, ...) ---
  if (/(^|_)(rate_limited|rate_limit_exceeded|too_many_requests)(_|$)/.test(code)) return true;
  if (status === 429) return true;
  if (/rate limit|too many requests/i.test(message)) return true;

  // --- Upstream/provider availability ---
  if (/(overloaded|service_unavailable|provider_unavailable|upstream_error|bad_gateway)/.test(code)) return true;
  if (status === 502 || status === 503 || status === 504) return true;

  // --- Model genuinely missing on this provider ---
  if (/(model_not_found|not_found|model_invalid)/.test(code)) return true;
  if (/(model\s+(not found|does not exist|is invalid|is unavailable)|no such model|unknown model|invalid model)/i.test(message)) return true;

  return false;
}

/**
 * Computes the attempt order for a chat call.
 * Pinned model first, then the remaining models in a 2-free / 1-paid
 * interleaved cadence, each tier internally sorted by `order`.
 * Example cadence after the pin: F,F,P,F,F,P,... Exhausted tiers are skipped;
 * leftover models of the other tier continue in order.
 * The pinned model is excluded from the free/paid tiers to avoid duplication.
 */
export function getAttemptOrder(state: FallbackState): number[] {
  const { models, pinnedIndex } = state;

  const freeQueue = models
    .map((m, i) => ({ m, index: i }))
    .filter(({ m, index }) => m.isFree && index !== pinnedIndex)
    .sort((a, b) => a.m.order - b.m.order);

  const paidQueue = models
    .map((m, i) => ({ m, index: i }))
    .filter(({ m, index }) => !m.isFree && index !== pinnedIndex)
    .sort((a, b) => a.m.order - b.m.order);

  const order: number[] = [pinnedIndex];
  while (freeQueue.length > 0 || paidQueue.length > 0) {
    for (let i = 0; i < 2 && freeQueue.length > 0; i++) {
      order.push(freeQueue.shift()!.index);
    }
    if (paidQueue.length > 0) {
      order.push(paidQueue.shift()!.index);
    }
  }
  return order;
}

/**
 * Core fallback loop for NON-streaming calls. The full response arrives at
 * the `await`, so a rejection there is the whole story.
 */
async function chatCompleteCore(
  messages: ChatMessage[],
  options: ChatFallbackOptions,
  state: FallbackState,
): Promise<unknown> {
  // Strip `stream` — for non-streaming calls it must never reach the API.
  const rest = { ...options } as Omit<ChatFallbackOptions, "stream"> & { stream?: boolean };
  delete rest.stream;
  const order = getAttemptOrder(state);
  let lastError: unknown;

  for (const idx of order) {
    const { model } = state.models[idx];
    try {
      const response = await puter.ai.chat(messages, { ...rest, model });
      // HTTP-200 error bodies RESOLVE (no `success: false` field for puter to
      // reject on) — a resolved failure must advance the fallback loop, never
      // pin the model as working.
      if (isErrorShapedResponse(response)) {
        if (isModelError(response)) {
          advancePinOnError(state, idx, order);
          lastError = response;
          continue;
        }
        throw response; // auth/malformed — fail fast, no retry
      }
      pinModel(state, idx);
      return response;
    } catch (error) {
      // Runtime-proof abort handling: check the signal itself, not just the
      // error shape (runtimes/wrappers may re-wrap DOMException aborts).
      if (isAbort(error, options.signal)) throw error;
      if (!isModelError(error)) throw error;
      advancePinOnError(state, idx, order);
      lastError = error;
    }
  }

  throw lastError ?? new Error("All available models failed");
}

/**
 * Chat with automatic model fallback, STREAMING response.
 *
 * IMPORTANT: this is an async GENERATOR, not a promise of an iterable.
 * For streaming, puter.ai.chat can RESOLVE its promise and only fail later
 * when the upstream error arrives as an exception during iteration. A loop
 * that returns the iterable without draining it would therefore pin a broken
 * model and let the error escape to the UI. This generator iterates INSIDE
 * the fallback loop: a model-error on a stream that has not emitted any VISIBLE
 * text yet transparently advances to the next attempt. Once text or a tool
 * call has been yielded, retrying would duplicate visible output, so the error
 * propagates. Usage/reasoning chunks carry no visible payload (consumers skip
 * them), so they must not block a retry. Upstream failures that arrive as
 * yielded ndjson error lines (not exceptions) are re-thrown for the same
 * classification/retry path.
 *
 * The model is pinned on the FIRST received chunk (earliest provable success)
 * and `onPin` fires at that moment so the UI can sync the active model.
 */
export async function* chatStreamWithFallback(
  messages: ChatMessage[],
  options: ChatFallbackOptions,
  state: FallbackState,
  onPin?: () => void,
): AsyncGenerator<ExtendedChatResponseChunk> {
  // Force streaming: puter.js enables streaming ONLY via `stream: true` in the
  // options object (AI.js: "stream flag from userParams"); the third positional
  // argument of puter.ai.chat is `testMode`, not a streaming toggle. So unlike
  // the non-streaming path, here `stream` must be INJECTED, never leaked as
  // false — stripping it silently degrades the call to a blocking
  // non-streaming completion.
  const rest = { ...options } as Omit<ChatFallbackOptions, "stream"> & { stream?: boolean };
  delete rest.stream;
  const order = getAttemptOrder(state);
  let lastError: unknown;

  for (const idx of order) {
    const { model } = state.models[idx];
    let emittedVisible = false;
    let pinned = false;
    try {
      const response = (await puter.ai.chat(messages, { ...rest, model, stream: true }, false)) as unknown;
      // The SDK can RESOLVE (not reject) an HTTP-429/failed request with the
      // plain error body, which is not async-iterable. Validate before
      // iterating: a non-iterable result is a failed attempt — classify it
      // like any other error instead of crashing with a TypeError that
      // bypasses the fallback loop entirely.
      if (
        !response ||
        typeof (response as AsyncIterable<ExtendedChatResponseChunk>)[Symbol.asyncIterator] !== "function"
      ) {
        // Case 1: the provider ignored `stream` and returned a COMPLETE
        // non-streaming completion (index/finish_reason/message/usage). That
        // is a SUCCESS — synthesize a single text chunk from message.content
        // instead of throwing it at the consumer. `content` may be null on a
        // refusal — still a success, just with no visible output.
        const completion = response as { message?: { content?: unknown } } | null;
        if (completion?.message && typeof completion.message === "object") {
          if (!pinned) {
            pinModel(state, idx);
            onPin?.();
            pinned = true;
          }
          const content = completion.message.content;
          if (typeof content === "string" && content) {
            emittedVisible = true;
            yield { text: content };
          }
          return;
        }
        // Case 2: an error body resolved as success (HTTP-429 etc.) —
        // classify it like any other failure instead of crashing with a
        // TypeError that bypasses the fallback loop entirely.
        if (isModelError(response)) {
          advancePinOnError(state, idx, order);
          lastError = response;
          continue;
        }
        throw response ?? new Error("Streaming chat returned no response");
      }
      for await (const chunk of response as AsyncIterable<ExtendedChatResponseChunk>) {
        // Upstream failures can arrive as yielded ndjson LINE OBJECTS, not
        // exceptions ({ error, message, code, attempts }) — the SDK's Stream
        // yields every line. Re-throw them so the fallback logic classifies
        // them like any other failure.
        if ((chunk as { error?: unknown } | null)?.error !== undefined) {
          throw chunk;
        }
        if (!pinned) {
          pinModel(state, idx);
          onPin?.();
          pinned = true;
        }
        // Only text or a tool call is visible to the user; usage/reasoning
        // chunks are skipped by consumers and must not block a retry.
        if (chunk?.text || chunk?.type === "tool_use") emittedVisible = true;
        yield chunk;
      }
      if (!pinned) {
        pinModel(state, idx);
        onPin?.();
      }
      return;
    } catch (error) {
      if (isAbort(error, options.signal)) throw error;
      if (!isModelError(error)) throw error;
      if (emittedVisible) throw error; // visible output already surfaced — cannot retry
      advancePinOnError(state, idx, order);
      lastError = error;
    }
  }

  throw lastError ?? new Error("All available models failed");
}

/**
 * Chat with automatic model fallback, NON-streaming response.
 * Returns a string or a message-wrapped object — typed, not a hope.
 */
export async function chatCompleteWithFallback(
  messages: ChatMessage[],
  options: ChatFallbackOptions,
  state: FallbackState,
): Promise<ChatCompletionResponse> {
  return (await chatCompleteCore(messages, options, state)) as ChatCompletionResponse;
}
