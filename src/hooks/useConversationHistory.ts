import { useState, useRef, useCallback, useEffect } from "react";
import type { TFunction } from "i18next";
import puter from "@heyputer/puter.js";
import type { ChatMessage, StreamingChatOptions } from "@heyputer/puter.js/types/modules/ai";
import type { Message, UsageInfo, LoadedDocument, SearchIndex } from "../types/Chat.types";
import { useAutoScroll } from "./useAutoScroll";
import { useSearch } from "./useSearch";
import { useCompaction } from "./useCompaction";
import type { FAQSearchIndex } from "./useSearch";
import { LLMModel } from "@/constants/chat";

// Extended ChatResponseChunk with tool_use properties
interface ExtendedChatResponseChunk {
  text?: string;
  type?: "tool_use" | "usage" | "reasoning";
  id?: string;
  name?: string;
  input?: { query: string; searchType: string };
  usage?: UsageInfo;
}

// PII stripping
const stripPIIFromResume = (content: string): string => {
  return content
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL REDACTED]")
    .replace(/\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, "[PHONE REDACTED]")
    .replace(/\b(?:ÇEKMEKÖY|CEKMEKOY),?\s*İ?STANBUL,?\s*TÜRKİYE\b/gi, "[ADDRESS REDACTED]")
    .replace(/\b(?:Çekmeköy|Cekmekoy),?\s*I?stanbul,?\s*Turkey\b/gi, "[ADDRESS REDACTED]");
};

const isContactInfoQuery = (query: string): boolean => {
  const normalized = query.toLowerCase();
  const contactKeywords = [
    "email",
    "e-posta",
    "mail",
    "phone",
    "telefon",
    "telephone",
    "mobile",
    "cep",
    "address",
    "adres",
    "location",
    "konum",
    "where",
    "nerede",
    "ikamet",
    "contact",
    "iletişim",
    "iletisim",
  ];
  return contactKeywords.some((kw) => normalized.includes(kw));
};

const extractFAQQuestions = (content: string): string[] => {
  const questions: string[] = [];
  const questionPattern = /^\*\*(\d+)\.\s+(.+?)\*\*\s*$/gm;
  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    questions.push(`${match[1]}. ${match[2].trim()}`);
  }
  return questions;
};

const parseUsageFromChunk = (part: unknown): UsageInfo | null => {
  if (
    part &&
    typeof part === "object" &&
    (part as { type?: string }).type === "usage" &&
    (part as { usage?: unknown }).usage &&
    typeof (part as { usage: object }).usage === "object"
  ) {
    const u = (part as { usage: { prompt?: number; completion?: number; input_cache_read?: number } }).usage;
    return {
      prompt: u.prompt ?? 0,
      completion: u.completion ?? 0,
      inputCacheRead: u.input_cache_read ?? 0,
      request: 0,
      billedUsage: 0,
      usdCents: 0,
    };
  }
  return null;
};

// System prompt - constant outside component
const SystemPrompt = `You are the official AI representative of Ahmet FATIHOGLU (Senior Software Developer & Architect). Your sole function is to answer questions about his professional background using ONLY the provided context documents (Resume, Projects) and the results of the \`expandSearch\` tool.

## 1. NON-NEGOTIABLE CONSTRAINTS
- **Language Lock:** Look ONLY at the final user message. Respond EXCLUSIVELY in that language. Do NOT inherit language from the conversation history or summary.
- **Zero Fabrication (EVIDENCE TRACEABILITY):** You are strictly FORBIDDEN from stating or implying that Ahmet has hands-on professional or project experience with a technology unless a specific named project or professional job description in the context explicitly says he used or built it.
  - A term listed in the "TECHNICAL SKILLS" section is a listed skill, NOT project evidence.
  - A term listed in the "FAQ QUESTIONS" list is an FAQ topic, NOT project evidence. FAQ titles are questions, not proof of capability.
- **Fidelity to Frameworks:** Maintain perfect technical accuracy regarding framework platforms. Do NOT classify desktop-only frameworks (WPF, WinForms) as web applications, nor classify web-only technologies (HTML, CSS, React, Angular) as desktop applications.
- **Mobile Stack Mapping:** Dart and Flutter are explicitly mobile development technologies in Ahmet's stack. Mentioning Flutter or Dart development in his professional history (such as his role at HİTİT BİLGİ TEKNOLOJİLERİ) or professional summary is direct proof of mobile application experience.
- **No Tables:** Never use markdown tables. Use vertical bulleted lists or compact prose.
- **Conciseness & HARD STOP:** Lead with the direct answer (except when a brief procedural acknowledgment is required by Section 4). Omit filler phrases. Never append concluding summaries or analytical paragraphs (e.g., "This demonstrates that..."). Provide the facts and execute a HARD STOP. [DO NOT PRINT \`HARD STOP\` TERM]
- **AI Overclaim Prevention:** Do not conflate tools built *for* AI consumption (e.g., RepoAIfy chunking) with tools that *generate* AI.

## 2. TOOL USE & FAQ PROTOCOL
Evaluate the Initial Context against the current question:
- IF Resume/Projects directly answers the question -> Answer immediately.
- IF Exact or near-exact match in FAQ QUESTIONS -> Call \`expandSearch(query="<exact FAQ text>", searchType="broader")\` immediately.
- IF Insufficient context -> Call \`expandSearch(query="<refined query>", searchType="broader")\`.
- IF Still insufficient -> Call \`expandSearch(query="<refined query>", searchType="crossLocale")\`.
- IF Empty Result -> State exactly: "I don't have specific information about that in my available documents."

## 3. CAPABILITY & EVIDENCE DISCIPLINE (The 3-Tier Rule)
When asked "Can he build X?" or "Does he know Y?", you MUST categorize your response into exactly one of these 3 Tiers:

- **TIER 1 (Explicitly Documented Project/Job Experience):**
  - *Trigger:* A specific named project (including its 'Technologies' line) or professional job description in the context explicitly states he built, used, or listed X.
  - *Action:* State the hands-on project experience, and cite the specific named project or role. Stop.

- **TIER 2 (Listed Skill/FAQ Topic Only - NO Project/Job Evidence):**
  - *Trigger:* X is listed in the main resume "TECHNICAL SKILLS" section or "FAQ QUESTIONS" titles, but is NOT mentioned anywhere inside any Project description (including its 'Technologies' list) or Professional Experience description.
  - *Action:* State exactly: "Ahmet has X listed as a technical skill in his resume, but his provided project portfolio and professional experience do not document specific hands-on project evidence for X." Do NOT assume or invent any project experience. STOP.

- **TIER 3 (Not Mentioned Anywhere):**
  - *Trigger:* X is NOT present anywhere in the Resume, Projects, or FAQ.
  - *Action:* State exactly: "The available documents do not explicitly mention X." Then, cite ONLY directly related named-project evidence (e.g., if asked about Kafka, cite MassTransit/RabbitMQ as related microservices messaging evidence). STOP. Do not provide general solution architectures.

## 4. META-REQUEST & FORMATTING HANDLING
- **Procedural Commands:** If the user issues a meta-instruction (e.g., "Speak in my language", "Be shorter") within their message, acknowledge it briefly (1 sentence) in the language of the CURRENT message before answering any accompanying question. Apply the instruction to subsequent turns. If the user ONLY issues the command without a question, do not re-answer the previous question.
- **Redaction Rendering:** When encountering masked dates (e.g., "07/[PHONE REDACTED]"), render them cleanly in prose (e.g., "July [Year]" or "Ongoing"). Do not output raw placeholders like "07/…".`;

interface UseConversationHistoryOptions {
  /** Current locale */
  locale: "en" | "tr";
  /** Search index for document retrieval */
  searchIndex: SearchIndex | null;
  /** Loaded documents per locale */
  loadedDocuments: Record<"en" | "tr", LoadedDocument[]>;
  /** LLM model to use */
  model: string;
  /** Context window size */
  contextWindow: number;
  /** Compaction threshold ratio */
  compactionThresholdRatio: number;
  /** Compaction max retries */
  compactionMaxRetries: number;
  /** Compaction retry base delay */
  compactionRetryBaseDelayMs: number;
  /** Pre-built FAQ search indexes per locale */
  faqSearchIndexes: Record<"en" | "tr", FAQSearchIndex | null>;
  /** Translation function */
  t: TFunction;
  /** Whether indexing is in progress */
  isIndexing: boolean;
}

interface UseConversationHistoryReturn {
  /** Current messages to display */
  messages: Message[];
  /** Current draft text */
  draft: string;
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Whether compaction is in progress */
  isHistorySummarizing: boolean;
  /** Accumulated token usage */
  tokenUsage: UsageInfo;
  /** Current context window */
  contextWindow: number;
  /** Send the current draft */
  send: () => Promise<void>;
  /** Handle input change */
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Handle key down on input */
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => void;
  /** Stop current request */
  handleStop: () => void;
  /** Auto-scroll container ref */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Auto-scroll bottom anchor ref */
  bottomRef: React.RefObject<HTMLDivElement | null>;
  /** Whether user has manually scrolled up */
  isUserScrolledUp: boolean;
  /** Reset the "user scrolled up" flag */
  resetScrollFlag: () => void;
  /** Manually trigger scroll to bottom */
  scrollToBottom: () => void;
}

export const useConversationHistory = (
  options: UseConversationHistoryOptions,
): UseConversationHistoryReturn => {
  const {
    locale,
    searchIndex,
    loadedDocuments,
    model,
    contextWindow,
    compactionThresholdRatio,
    compactionMaxRetries,
    compactionRetryBaseDelayMs,
    t,
    isIndexing,
    faqSearchIndexes,
  } = options;

  const [messages, setMessages] = useState<Message[]>(() => [{
    id: crypto.randomUUID(),
    role: "assistant",
    text: t("ui.chat.initialMessage"),
  }]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<UsageInfo>({
    prompt: 0,
    completion: 0,
    inputCacheRead: 0,
    request: 0,
    billedUsage: 0,
    usdCents: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const apiHistoryRef = useRef<Array<{ role: "user" | "assistant" | "system"; content: string }>>([]);
  const draftRef = useRef(draft);
  const tokenUsageRef = useRef(tokenUsage);

  // Refs for values accessed inside the async send() callback.
  // These stay in sync via effects below, so send() always reads the
  // latest value without needing them in its dependency array — this
  // eliminates stale-closure bugs in the expand-search follow-up path.
  const loadedDocumentsRef = useRef(loadedDocuments);
  const searchIndexRef = useRef(searchIndex);

  // Sync refs with state (useEffect to avoid render-time ref updates)
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    tokenUsageRef.current = tokenUsage;
  }, [tokenUsage]);

  useEffect(() => {
    loadedDocumentsRef.current = loadedDocuments;
  }, [loadedDocuments]);

  useEffect(() => {
    searchIndexRef.current = searchIndex;
  }, [searchIndex]);

  // Sub-hooks
  const { scrollContainerRef, bottomRef, isUserScrolledUp, resetScrollFlag, scrollToBottom } = useAutoScroll({
    deps: [messages],
  });

  // Direct ref for the stable resetScrollFlag callback (identity is now stable from useAutoScroll)
  const resetScrollFlagRef = useRef(resetScrollFlag);
  useEffect(() => {
    resetScrollFlagRef.current = resetScrollFlag;
  }, [resetScrollFlag]);

  const { performSearch, searchFAQ } = useSearch({ searchIndex, faqSearchIndexes, locale });

  // Refs to avoid stale closures in send callback for search functions
  const performSearchRef = useRef(performSearch);
  const searchFAQRef = useRef(searchFAQ);
  useEffect(() => {
    performSearchRef.current = performSearch;
  }, [performSearch]);
  useEffect(() => {
    searchFAQRef.current = searchFAQ;
  }, [searchFAQ]);

  // Estimate tokens for compacted history (used in compaction success callback)
  const estimateTokens = useCallback((text: string): number => Math.ceil(text.length / 4), []);

  const compaction = useCompaction({
    model,
    contextWindow,
    thresholdRatio: compactionThresholdRatio,
    maxRetries: compactionMaxRetries,
    retryBaseDelayMs: compactionRetryBaseDelayMs,
    callbacks: {
      onSuccess: (compacted) => {
        // Update API history with compacted version
        apiHistoryRef.current = compacted;
        // Reset token usage to reflect compacted history
        const compactedTokens = compacted.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);
        const newTokenUsage: UsageInfo = {
          prompt: Math.floor(compactedTokens * 0.6),
          completion: 0,
          inputCacheRead: Math.floor(compactedTokens * 0.4),
          request: 0,
          billedUsage: 0,
          usdCents: 0,
        };
        tokenUsageRef.current = newTokenUsage;
        setTokenUsage(newTokenUsage);
      },
      onFailure: (error, originalHistory) => {
        console.error("[useConversationHistory] Compaction failed:", error);
        // Fallback: simple truncation to last 2 turns
        apiHistoryRef.current = originalHistory.slice(-2);
        const fallbackTokens = originalHistory.slice(-2).reduce((sum, msg) => sum + estimateTokens(msg.content), 0);
        const fallbackUsage: UsageInfo = {
          prompt: Math.floor(fallbackTokens * 0.6),
          completion: 0,
          inputCacheRead: Math.floor(fallbackTokens * 0.4),
          request: 0,
          billedUsage: 0,
          usdCents: 0,
        };
        tokenUsageRef.current = fallbackUsage;
        setTokenUsage(fallbackUsage);
      },
    },
  });

  // Stable refs for compaction callbacks to avoid stale closures and dependency churn
  const checkAndEnqueueCompactionRef = useRef(compaction.checkAndEnqueueCompaction);
  const abortCompactionRef = useRef(compaction.abortCompaction);
  useEffect(() => {
    checkAndEnqueueCompactionRef.current = compaction.checkAndEnqueueCompaction;
  }, [compaction.checkAndEnqueueCompaction]);
  useEffect(() => {
    abortCompactionRef.current = compaction.abortCompaction;
  }, [compaction.abortCompaction]);

  // Sync compaction state - use direct assignment from compaction hook return
  // This avoids setState in effect; the compaction hook manages its own state
  // We just read from it directly in the return object

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortCompactionRef.current();
    };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
  }, []);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const send = useCallback(async () => {
    const currentSearchIndex = searchIndexRef.current;
    const currentLoadedDocs = loadedDocumentsRef.current;
    if (!draftRef.current.trim() || !currentSearchIndex || isIndexing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = draftRef.current.trim().slice(0, 2000);
    const history = apiHistoryRef.current;
    resetScrollFlagRef.current();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: userMessage }]);
    setDraft("");
    setIsLoading(true);

    try {
      const loadedDocs = currentLoadedDocs[locale];
      const resumeRaw = loadedDocs.find((d) => d.title === "Resume" || d.title === "Özgeçmiş")?.content.trim() ?? "";
      const resumeContent = isContactInfoQuery(userMessage) ? resumeRaw : stripPIIFromResume(resumeRaw);
      const projectsContent = loadedDocs.find((d) => d.title === "Projects" || d.title === "Projeler")?.content.trim() ?? "";
      const faqContent = loadedDocs.find((d) => d.title === "FAQ" || d.title === "SSS")?.content.trim() ?? "";
      const faqQuestions = extractFAQQuestions(faqContent);

      if (!resumeContent && !projectsContent && faqQuestions.length === 0) {
        apiHistoryRef.current = [...history, { role: "user" as const, content: userMessage }];
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: t("ui.chat.noRelevantInformationFoundInTheDocuments") }]);
        return;
      }

      const initialContext = `RESUME:
${resumeContent}

ALL PROJECTS:
${projectsContent}

FAQ QUESTIONS (use expandSearch tool to get the full answer for any matching question):
${faqQuestions.join("\n")}`;

      const tools = [
        {
          type: "function" as const,
          function: {
            name: "expandSearch",
            description:
              "Perform an expanded document search with relaxed parameters when the initial context is insufficient or partially relevant. Call this when you need more information to answer the user's question. Returns additional document chunks that may contain relevant information.",
            parameters: {
              type: "object" as const,
              properties: {
                query: {
                  type: "string",
                  description: "A refined search query. Use synonyms, related terms, or broader keywords compared to the original user question to find relevant documents.",
                },
                searchType: {
                  type: "string",
                  enum: ["broader", "crossLocale"],
                  description: '"broader" = relaxed fuzzy matching, more results, same locale. "crossLocale" = search in the other language documents as fallback.',
                },
              },
              required: ["query", "searchType"],
            },
          },
        },
      ];

      const baseSystemContent = `${SystemPrompt}\n\n## Initial Context (from document search)\n${initialContext}`;

      const apiMessages: Array<ChatMessage> = [
        { role: "system", content: baseSystemContent },
        ...history,
        { role: "user", content: userMessage },
      ];

      const apiOptions: StreamingChatOptions = {
        tools,
        stream: true,
        verbosity: "low",
        model: LLMModel,
        signal: abortControllerRef.current.signal,
      } as StreamingChatOptions;

      const response = (await puter.ai.chat(apiMessages, apiOptions, false)) as AsyncIterable<ExtendedChatResponseChunk>;

      const assistantMessage: Message = { id: crypto.randomUUID(), role: "assistant", text: "" };
      setMessages((prev) => [...prev, assistantMessage]);
      const streamingId = assistantMessage.id;

      let assistantText = "";
      let pendingToolCall: { id: string; name: string; input: { query: string; searchType: string } } | null = null;
      let wasAborted = false;
      let turnUsage: UsageInfo = { prompt: 0, completion: 0, inputCacheRead: 0, request: 0, billedUsage: 0, usdCents: 0 };

      for await (const part of response) {
        if (abortControllerRef.current?.signal.aborted) {
          wasAborted = true;
          break;
        }

        const usage = parseUsageFromChunk(part);
        if (usage) {
          turnUsage = usage;
        }

        if (part?.type === "reasoning") continue;

        if (part?.text) {
          assistantText += part.text;
          setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
        }

        if (part?.type === "tool_use" && part.id && part.name === "expandSearch" && part.input && typeof part.input.query === "string" && (part.input.searchType === "broader" || part.input.searchType === "crossLocale")) {
          pendingToolCall = {
            id: part.id,
            name: part.name,
            input: part.input as { query: string; searchType: string },
          };
        }
      }

      if (!wasAborted) {
        setTokenUsage((prev) => ({
          ...prev,
          prompt: prev.prompt + turnUsage.prompt,
          inputCacheRead: prev.inputCacheRead + turnUsage.inputCacheRead,
        }));
        tokenUsageRef.current.prompt += turnUsage.prompt;
        tokenUsageRef.current.inputCacheRead += turnUsage.inputCacheRead;
      }

      if (!wasAborted && pendingToolCall && pendingToolCall.name === "expandSearch") {
        const { query: expandedQuery, searchType } = pendingToolCall.input;

        const faqResult = searchType !== "crossLocale" ? searchFAQRef.current(expandedQuery) : null;

        let expandedContext: string | null;
        if (faqResult) {
          expandedContext = faqResult;
        } else {
          const fuzzy = searchType === "crossLocale" ? 0.3 : 0.4;
          const maxResults = searchType === "crossLocale" ? 8 : 10;
          const localeFilter = searchType === "crossLocale" ? "all" : "same";
          expandedContext = performSearchRef.current(expandedQuery, fuzzy, maxResults, localeFilter);
        }

        const toolCallMessage = {
          role: "assistant" as const,
          content: assistantText || "Let me search for more information.",
          tool_calls: [
            {
              id: pendingToolCall.id,
              type: "function" as const,
              function: {
                name: pendingToolCall.name,
                arguments: JSON.stringify(pendingToolCall.input),
              },
            },
          ],
        };

        const toolResultMessage = {
          role: "tool" as const,
          tool_call_id: pendingToolCall.id,
          content: expandedContext || "No additional information found.",
        };

        const expandedSystemContent = expandedContext
          ? `${SystemPrompt}\n\n## Initial Context\n${initialContext}\n\n## Expanded Context (from additional search)\n${expandedContext}`
          : baseSystemContent;

        const followUpMessages = [
          { role: "system", content: expandedSystemContent },
          ...history,
          { role: "user", content: userMessage },
          toolCallMessage,
          toolResultMessage,
        ];

        const finalApiOptions: StreamingChatOptions = {
          stream: true,
          verbosity: "low",
          model: LLMModel,
          signal: abortControllerRef.current.signal,
        } as StreamingChatOptions;

        const finalResponse = (await puter.ai.chat(followUpMessages, finalApiOptions)) as AsyncIterable<ExtendedChatResponseChunk>;

        assistantText = "";
        turnUsage = { prompt: 0, completion: 0, inputCacheRead: 0, request: 0, billedUsage: 0, usdCents: 0 };

        for await (const finalPart of finalResponse) {
          if (abortControllerRef.current?.signal.aborted) {
            wasAborted = true;
            break;
          }
          const finalUsage = parseUsageFromChunk(finalPart);
          if (finalUsage) {
            turnUsage = finalUsage;
          }

          if (finalPart?.type === "reasoning") continue;

          if (finalPart?.text) {
            assistantText += finalPart.text;
            setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
          }
        }
      }

      if (!wasAborted) {
        setTokenUsage((prev) => ({
          ...prev,
          prompt: prev.prompt + turnUsage.prompt,
          inputCacheRead: prev.inputCacheRead + turnUsage.inputCacheRead,
        }));
        tokenUsageRef.current.prompt += turnUsage.prompt;
        tokenUsageRef.current.inputCacheRead += turnUsage.inputCacheRead;
      }

      if (wasAborted) {
        setMessages((prev) => prev.filter((m) => m.id !== streamingId));
      } else {
        const newHistory = [
          ...history,
          { role: "user" as const, content: userMessage },
          { role: "assistant" as const, content: assistantText },
        ];
        apiHistoryRef.current = newHistory;

        checkAndEnqueueCompactionRef.current(newHistory, tokenUsageRef.current);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("[useConversationHistory] send error:", error);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: t("ui.chat.encounteredError") }]);
    } finally {
      setIsLoading(false);
    }
  }, [
    locale,
    isIndexing,
    t,
  ]);

  // Enter key handler for input (respects IME composition)
  // Escape and focus are handled by the parent's useKeyboardShortcuts
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
      if (e.nativeEvent.isComposing) return; // IME composition
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await send();
      }
    },
    [send],
  );

  return {
    messages,
    draft,
    isLoading,
    isHistorySummarizing: compaction.isHistorySummarizing,
    tokenUsage,
    contextWindow,
    send,
    handleChange,
    handleKeyDown,
    handleStop,
    // Expose individual auto-scroll fields (stable identities from useAutoScroll)
    scrollContainerRef,
    bottomRef,
    isUserScrolledUp,
    resetScrollFlag,
    scrollToBottom,
  };
}
