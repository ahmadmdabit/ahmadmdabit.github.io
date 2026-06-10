import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import DOMPurify from "dompurify";
import puter, { type ChatMessage } from "@heyputer/puter.js";
import type { ChatResponseChunk, StreamingChatOptions } from "@heyputer/puter.js/types/modules/ai";
import MiniSearch from "minisearch";
import { marked } from "marked";
import { StatusIndicator } from "@/atoms/StatusIndicator";
import { CloseButton } from "@/atoms/CloseButton";

const LLMModel = "openai/gpt-oss-120b:free"; // ContextWindow: 131K
// const LLMModel = "openai/gpt-oss-120b", // ContextWindow: 131K
// const LLMModel = "anthropic/claude-haiku-4-5", // ContextWindow: 200K
// const LLMModel = "deepseek/deepseek-v4-flash", // ContextWindow: 1M
// const LLMModel = "z-ai/glm-4.7-flash", // ContextWindow: 128K

// History management constants
const MAX_HISTORY_TURNS = 20; // Keep last 20 turns (10 user + 10 assistant) to prevent token blowup

declare module "@heyputer/puter.js" {
  interface Puter {
    quiet: boolean;
  }

  interface ChatResponseChunk {
    id?: string;
    name?: string;
    type?: string;
    input?: { query: string; searchType: string };
  }

  interface StreamingChatOptions {
    signal?: AbortSignal;
  }
}

puter.quiet = true;

interface DocumentChunk {
  id: string;
  title: string;
  text: string;
  source: string;
  locale: string;
}

interface SearchIndex {
  miniSearch: MiniSearch<DocumentChunk>;
  documents: DocumentChunk[];
}

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  text: string;
}

const StyledChatPopupPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  position: "fixed",
  top: 64,
  right: 16,
  maxWidth: 620,
  height: "85vh",
  zIndex: 1210,
  flexDirection: "column",
  borderRadius: 5,
  overflow: "hidden",
  transform: "translateX(170%)",
  transition: "transform 0.2s ease-in-out",
  "&.open": {
    transform: "translateX(0)",
  },
  [theme.breakpoints.down("sm")]: {
    width: "calc(100vw - 32px)",
    maxWidth: "none",
  },
  [theme.breakpoints.up("sm")]: {
    width: "50vw",
  },
}));

const SystemPrompt = `You are a professional, knowledgeable, and approachable AI assistant representing Ahmet FATIHOGLU — a Senior Software Developer and Architect.

## Your Role
Answer questions about Ahmet's professional background, including:
- Work experience (companies, roles, durations, responsibilities)
- Technical skills and areas of expertise
- Projects (architecture, technologies, challenges, outcomes)
- Education and certifications
- Languages spoken
- Career highlights and achievements
- Leadership, mentoring, and collaboration style

## Response Guidelines
- **Be professional yet conversational** — write like a knowledgeable colleague, not a robot.
- **Be specific and detailed only when supported** — draw from the context to provide concrete examples, technologies, and outcomes; if the context is silent, say so.
- **Use the same language** as the user's question (English or Turkish).
- **Never fabricate** information not present in the context documents.
- **Do not treat previous assistant messages as factual evidence.** They are conversation history only. Use the current Resume, Projects, FAQ answers, and tool results as the source of truth.
- **Evidence discipline:** When the user asks for proof, examples, or project-based evidence, separate direct named-project evidence from general resume skill listings. Never present a listed skill as project evidence unless a named project or role explicitly supports it.
- **Capability discipline:** For questions like "Can he build X?", answer with what the documents explicitly support. If X is not directly mentioned, say that directly and then mention only related documented experience.
- **Keep responses focused** — don't add unnecessary filler or disclaimers.
- **Avoid outputting tables** - as much as possible prefer to avoid responding with tables. Respond with alternatives like formatted vertical list.

## Context Evaluation & Tool Usage
You are provided with "Initial Context" containing Resume, Projects, and a FAQ question list. You also have access to an \`expandSearch\` tool for retrieving detailed answers.

**Evaluate the Initial Context carefully:**

1. **Sufficient** — The Resume or Projects context directly contains the information needed to fully answer the user's question. → Answer immediately using the context.

2. **FAQ question match** — The user's question matches or closely relates to a question in the FAQ QUESTIONS list → **Call \`expandSearch\`** with the exact FAQ question text as the query and searchType="broader". The FAQ detailed answers are not included in the initial context; you must use expandSearch to retrieve them.

3. **Partially sufficient / Insufficient** — The context is related but doesn't directly answer the question, and no FAQ question matches. → **Call \`expandSearch\`** with a refined query using synonyms or broader terms. For example:
   - User asks "Where does he work?" → call \`expandSearch\` with query="work experience companies employment" and searchType="broader"
   - User asks about a specific project not in context → call \`expandSearch\` with query="[project name] architecture technologies" and searchType="broader"
   - If broader search still doesn't help → call \`expandSearch\` with searchType="crossLocale" as a last resort

4. **After expandSearch returns results:**
   - If the expanded context now contains relevant information → Answer using the combined context.
   - If the expanded context is still empty or irrelevant → Politely say: "I don't have specific information about that in my available documents. Feel free to ask me about Ahmet's experience, skills, projects, education, or certifications."

**Important:** Always call \`expandSearch\` when the Initial Context doesn't directly answer the user's question, or when the user's question matches an FAQ entry. When answering FAQ-related questions, use the FAQ answer as the primary source and enhance it with relevant details from the Resume or Projects context when they add value — for example, expanding a career-summary answer with specific project names, technologies, or metrics from the Projects list.

## Tone
Professional, confident, concise, and helpful. Mirror the user's level of formality.

## Language Handling
The conversation history may contain messages in English or Turkish from previous turns. Always respond in the language of the user's current question, regardless of what language was used earlier in the conversation.`;

interface DocumentSource {
  readonly path: string;
  readonly title: string;
  readonly locale: string;
}

interface LoadedDocument extends DocumentSource {
  content: string;
}

const DocumentSources: { readonly en: DocumentSource[]; readonly tr: DocumentSource[] } = {
  en: [
    { path: "/data/Resume-EN.md", title: "Resume", locale: "en" },
    { path: "/data/Projects-EN.md", title: "Projects", locale: "en" },
    { path: "/data/FAQ-EN.md", title: "FAQ", locale: "en" },
  ],
  tr: [
    { path: "/data/Resume-TR.md", title: "Özgeçmiş", locale: "tr" },
    { path: "/data/Projects-TR.md", title: "Projeler", locale: "tr" },
    { path: "/data/FAQ-TR.md", title: "SSS", locale: "tr" },
  ],
} as const;

const makeMessage = (role: MessageRole, text: string): Message => ({
  id: crypto.randomUUID(),
  role,
  text,
});

/**
 * Trim conversation history to keep only the last N turns
 * Each "turn" consists of one user and one assistant message (2 messages)
 */
const trimHistory = (history: Array<{ role: "user" | "assistant"; content: string }>): Array<{ role: "user" | "assistant"; content: string }> => {
  if (history.length <= MAX_HISTORY_TURNS) return history;
  // Keep the last MAX_HISTORY_TURNS messages
  return history.slice(-MAX_HISTORY_TURNS);
};

/**
 * Strip PII (email, phone, address) from resume content
 * to minimize data sent to LLM on every request.
 */
const stripPIIFromResume = (content: string): string => {
  return content
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL REDACTED]")
    .replace(/\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, "[PHONE REDACTED]")
    .replace(/\b(?:ÇEKMEKÖY|CEKMEKOY),?\s*İ?STANBUL,?\s*TÜRKİYE\b/gi, "[ADDRESS REDACTED]")
    .replace(/\b(?:Çekmeköy|Cekmekoy),?\s*I?stanbul,?\s*Turkey\b/gi, "[ADDRESS REDACTED]");
};

const chunkDocument = (content: string, source: string, locale: string): DocumentChunk[] => {
  const chunks: DocumentChunk[] = [];

  // Special handling for FAQ files: one chunk per question
  if (source === "FAQ" || source === "SSS") {
    return chunkFAQDocument(content, source, locale);
  }

  // Standard chunking for Resume and Projects: split by headings (h1-h3)
  // Use multiline regex to match #, ##, ### headings at start of line
  const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);

  sections.forEach((section, index) => {
    const lines = section.trim().split("\n");
    const title = lines[0].trim();
    const text = lines.slice(1).join("\n").trim();

    if (text.length > 50) {
      chunks.push({
        id: `${source}-${locale}-${index}`,
        title,
        text: `${title}\n\n${text}`,
        source,
        locale,
      });
    }
  });

  return chunks;
};

const chunkFAQDocument = (content: string, source: string, locale: string): DocumentChunk[] => {
  const chunks: DocumentChunk[] = [];
  // Match each question block: **N. Question text** followed by answer text
  // The pattern matches bold numbered questions and captures everything until the next bold question or end
  // Using a more robust regex that handles * in question text and uses proper multiline matching
  const questionPattern = /^\*\*(\d+)\.\s+(.+?)\*\*\s*\r?\n([\s\S]*?)(?=^\*\*\d+\.\s+.+?\*\*\s*$|$)/gm;

  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    const questionNum = match[1];
    const questionText = match[2].trim();
    const answerText = match[3].trim();

    // Skip entries with `EXTERNAL` tag — these are placeholders for external answers
    // if (answerText.startsWith("`EXTERNAL`")) continue;

    // Build the full text: question + answer (including extended answer if present)
    const fullText = `Q: ${questionText}\n\nA: ${answerText}`;

    if (fullText.length > 50) {
      chunks.push({
        id: `${source}-${locale}-q${questionNum}`,
        title: questionText,
        text: fullText,
        source,
        locale,
      });
    }
  }

  return chunks;
};

const extractFAQQuestions = (content: string): string[] => {
  const questions: string[] = [];
  // Use the same robust pattern as chunkFAQDocument for consistency
  const questionPattern = /^\*\*(\d+)\.\s+(.+?)\*\*\s*$/gm;
  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    questions.push(`${match[1]}. ${match[2].trim()}`);
  }
  return questions;
};

/**
 * Dedicated FAQ search path. Looks for an exact or near-exact match
 * of the query against the FAQ question list, then returns the matched
 * Q+A chunk(s) directly — bypassing the general MiniSearch index.
 *
 * Returns null if no FAQ question matches within the threshold.
 */
const searchFAQ = (searchIndex: SearchIndex, query: string, locale: "en" | "tr"): string | null => {
  // Filter documents to FAQ chunks in the requested locale
  const faqDocs = searchIndex.documents.filter((d) => d.locale === locale && (d.source === "FAQ" || d.source === "SSS"));
  if (faqDocs.length === 0) return null;

  // Build a transient MiniSearch over FAQ docs only
  const faqIndex = new MiniSearch<DocumentChunk>({
    fields: ["title", "text"],
    storeFields: ["title", "text", "source", "locale"],
    searchOptions: {
      boost: { title: 3 },
      fuzzy: 0.1, // very tight fuzzy — we want near-exact matches
      prefix: true,
    },
  });
  faqIndex.addAll(faqDocs);

  const results = faqIndex.search(query);
  if (results.length === 0) return null;

  // Take the top 3 matches, joined
  const top = results.slice(0, 3);
  return top.map((r) => `[Source: ${r.source}]\n${r.text}`).join("\n\n---\n\n");
};

const loadAndIndexDocuments = async (locale: string): Promise<{ searchIndex: SearchIndex; loadedDocs: LoadedDocument[] }> => {
  const sources = DocumentSources[locale as keyof typeof DocumentSources] || DocumentSources.en;
  const allChunks: DocumentChunk[] = [];
  const loadedDocs: LoadedDocument[] = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.path);
      if (response.ok) {
        const content = await response.text();
        loadedDocs.push({ path: source.path, title: source.title, locale: source.locale, content });
        const chunks = chunkDocument(content, source.title, source.locale);
        allChunks.push(...chunks);
      }
    } catch (error) {
      console.error(`Failed to load ${source.path}:`, error);
    }
  }

  const miniSearch = new MiniSearch<DocumentChunk>({
    fields: ["title", "text"],
    storeFields: ["title", "text", "source", "locale"],
    searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  miniSearch.addAll(allChunks);

  return { searchIndex: { miniSearch, documents: allChunks }, loadedDocs };
};

const MarkdownRenderer = memo(({ content }: { content: string }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await marked.parse(content, { async: true });
      if (!cancelled) {
        setHtml(
          DOMPurify.sanitize(raw, {
            // Security hardening: forbid javascript: URIs and dangerous protocols
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
            // Allow target and rel attributes for link hardening
            ADD_ATTR: ["target", "rel"],
            // Forbid dangerous tags
            FORBID_TAGS: ["style", "iframe", "form", "script", "object", "embed"],
            // Forbid event handler attributes
            FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
          }),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <Box
      component="div"
      sx={{ "& p": { m: 0 }, "& code": { fontFamily: "monospace" } }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

export const ChatPopup: React.FC<{ open: boolean; onClose: () => void }> = memo(({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  // Store loaded document content per locale to avoid mutating DocumentSources
  const loadedDocumentsRef = useRef<Record<"en" | "tr", LoadedDocument[]>>({ en: [], tr: [] });
  // When true, the user has scrolled up away from the bottom; pause auto-scroll.
  const isUserScrolledUpRef = useRef(false);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const currentLocale = i18n.language.startsWith("tr") ? "tr" : "en";

  // Keep a ref to draft so send() doesn't need draft as a dependency.
  // Without this, send() — and handleKeyDown which depends on it — would
  // be recreated on every keystroke.
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (open && !isIndexing && !searchIndex) {
      setIsIndexing(true);
      Promise.all([loadAndIndexDocuments("en"), loadAndIndexDocuments("tr")])
        .then(([enResult, trResult]) => {
          const allDocs = [...enResult.searchIndex.documents, ...trResult.searchIndex.documents];
          const mergedMiniSearch = new MiniSearch<DocumentChunk>({
            fields: ["title", "text"],
            storeFields: ["title", "text", "source", "locale"],
            searchOptions: {
              boost: { title: 2 },
              fuzzy: 0.2,
              prefix: true,
            },
          });
          mergedMiniSearch.addAll(allDocs);
          setSearchIndex({ miniSearch: mergedMiniSearch, documents: allDocs });
          // Store loaded documents for initial context access
          loadedDocumentsRef.current.en = enResult.loadedDocs;
          loadedDocumentsRef.current.tr = trResult.loadedDocs;
          setIsIndexing(false);
        })
        .catch(() => setIsIndexing(false));
    }
  }, [isIndexing, open, searchIndex]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const initialMsg = makeMessage("assistant", t("ui.chat.initialMessage"));
      setMessages([initialMsg]);
      apiHistoryRef.current = [];
    }
  }, [messages.length, open, t]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      // Consider "at the bottom" if within 80px of the bottom edge.
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      isUserScrolledUpRef.current = distanceFromBottom > 80;
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll when messages change — but only if the user hasn't scrolled up.
  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 220);

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener("keydown", handleEscape);
      };
    }
    return undefined;
  }, [open, onClose]);

  // Search function - plain function since only used in send() and doesn't need memoization
  const performSearch = useCallback(
    (query: string, fuzzy: number, maxResults: number, localeFilter: "same" | "crossLocale" | "all", locale: "en" | "tr"): string | null => {
      if (!searchIndex) return null;

      const results = searchIndex.miniSearch.search(query, {
        boost: { title: 2 },
        fuzzy,
        prefix: true,
      });

      let filtered: typeof results;
      if (localeFilter === "same") {
        filtered = results.filter((r) => r.locale === locale);
      } else if (localeFilter === "crossLocale") {
        // crossLocale: search only the OTHER locale
        const otherLocale = locale === "en" ? "tr" : "en";
        filtered = results.filter((r) => r.locale === otherLocale);
      } else {
        // "all" - search all locales (legacy, not used by tool)
        filtered = results;
      }

      const top = filtered.slice(0, maxResults);

      if (top.length === 0) return null;

      return top.map((r) => `[Source: ${r.source}]\n${r.text}`).join("\n\n---\n\n");
    },
    [searchIndex],
  );

  const send = useCallback(async () => {
    if (!draftRef.current.trim() || !searchIndex || isIndexing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = draftRef.current.trim().slice(0, 2000);
    const history = apiHistoryRef.current;
    // User is sending a new message — reset the scrolled-up flag so we
    // auto-scroll to the new exchange.
    isUserScrolledUpRef.current = false;
    setMessages((prev) => [...prev, makeMessage("user", userMessage)]);
    setDraft("");
    setIsLoading(true);

    try {
      // Step 1: Initial strict search
      // const initialContext = performSearch(userMessage, 0.2, 5, "same");
      const loadedDocs = loadedDocumentsRef.current[currentLocale];
      const resumeContentRaw = loadedDocs.find((d) => d.title === "Resume" || d.title === "Özgeçmiş")?.content.trim() ?? "";
      const resumeContent = stripPIIFromResume(resumeContentRaw);
      const projectsContent = loadedDocs.find((d) => d.title === "Projects" || d.title === "Projeler")?.content.trim() ?? "";
      const faqContent = loadedDocs.find((d) => d.title === "FAQ" || d.title === "SSS")?.content.trim() ?? "";
      const faqQuestions = extractFAQQuestions(faqContent);

      if (!resumeContent && !projectsContent && faqQuestions.length === 0) {
        apiHistoryRef.current = trimHistory([...history, { role: "user" as const, content: userMessage }]);
        setMessages((prev) => [...prev, makeMessage("assistant", t("ui.chat.noRelevantInformationFoundInTheDocuments"))]);
        return;
      }

      const initialContext = `RESUME:
${resumeContent}

ALL PROJECTS:
${projectsContent}

FAQ QUESTIONS (use expandSearch tool to get the full answer for any matching question):
${faqQuestions.join("\n")}`;

      // Define the expandSearch tool for the LLM
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

      // Build initial messages with the context
      const baseSystemContent = `${SystemPrompt}\n\n## Initial Context (from document search)\n${initialContext}`;

      // Trim history to prevent token blowup
      const trimmedHistory = trimHistory(history);
      const apiMessages: Array<ChatMessage> = [{ role: "system", content: baseSystemContent }, ...trimmedHistory, { role: "user", content: userMessage }];
      const apiOptions: StreamingChatOptions = {
        tools,
        stream: true,
        verbosity: "low", // OpenAI models only.
        // reasoning: {
        //   effort: "minimal", // OpenAI models only.
        // },
        model: LLMModel,
        signal: abortControllerRef.current.signal,
      } as StreamingChatOptions;

      // Step 2: Call AI with stream AND tools
      //chat (messages: ChatMessage[], options: StreamingChatOptions, testMode?: boolean): AsyncIterable<ChatResponseChunk>;
      const response = (await puter.ai.chat(apiMessages, apiOptions, false)) as AsyncIterable<ChatResponseChunk>;

      // Stream handling with tool call detection
      const assistantMessage = makeMessage("assistant", "");
      setMessages((prev) => [...prev, assistantMessage]);
      const streamingId = assistantMessage.id;

      let assistantText = "";
      let pendingToolCall: { id: string; name: string; input: { query: string; searchType: string } } | null = null;
      let wasAborted = false;

      for await (const part of response) {
        if (abortControllerRef.current?.signal.aborted) {
          wasAborted = true;
          break;
        }

        // Standard text stream
        if (part?.text) {
          assistantText += part.text;
          setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
        }

        // Tool call detected
        if (part?.type === "tool_use" && part.id && part.name === "expandSearch" && part.input && typeof part.input.query === "string" && (part.input.searchType === "broader" || part.input.searchType === "crossLocale")) {
          pendingToolCall = {
            id: part.id,
            name: part.name,
            input: part.input as { query: string; searchType: string },
          };
        }
      }

      // Step 3: If LLM requested expanded search, execute it
      if (!wasAborted && pendingToolCall && pendingToolCall.name === "expandSearch") {
        const { query: expandedQuery, searchType: searchType } = pendingToolCall.input;

        // Q2: Dedicated FAQ path — check if the query matches an FAQ question first
        const faqResult = searchType !== "crossLocale" ? searchFAQ(searchIndex, expandedQuery, currentLocale) : null;

        let expandedContext: string | null;
        if (faqResult) {
          // FAQ match found — use it directly, skip general search
          expandedContext = faqResult;
        } else {
          // Fall back to general MiniSearch
          const fuzzy = searchType === "crossLocale" ? 0.3 : 0.4;
          const maxResults = searchType === "crossLocale" ? 8 : 10;
          const localeFilter = searchType === "crossLocale" ? "all" : "same";

          expandedContext = performSearch(expandedQuery, fuzzy, maxResults, localeFilter, currentLocale);
        }

        // Build conversation history including the tool call
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

        // Step 4: Send expanded results back to LLM for final answer
        const expandedSystemContent = expandedContext ? `${SystemPrompt}\n\n## Initial Context\n${initialContext}\n\n## Expanded Context (from additional search)\n${expandedContext}` : baseSystemContent;

        // Trim history for follow-up as well
        const trimmedHistory = trimHistory(history);
        const followUpMessages = [{ role: "system", content: expandedSystemContent }, ...trimmedHistory, { role: "user", content: userMessage }, toolCallMessage, toolResultMessage];

        const finalApiOptions: StreamingChatOptions = {
          stream: true,
          verbosity: "low", // OpenAI models only.
          // reasoning: {
          //   effort: "minimal", // OpenAI models only.
          // },
          model: LLMModel,
          signal: abortControllerRef.current.signal,
        } as StreamingChatOptions;

        //chat (messages: ChatMessage[], options: StreamingChatOptions, testMode?: boolean): AsyncIterable<ChatResponseChunk>;
        const finalResponse = (await puter.ai.chat(followUpMessages, finalApiOptions)) as AsyncIterable<ChatResponseChunk>;

        // Reset and stream the final response
        assistantText = "";
        for await (const finalPart of finalResponse) {
          if (abortControllerRef.current?.signal.aborted) {
            wasAborted = true;
            break;
          }
          if (finalPart?.text) {
            assistantText += finalPart.text;
            setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
          }
        }
      }

      if (wasAborted) {
        // Remove the empty/partial assistant bubble that was added before
        // streaming started, so the UI doesn't show a blank message.
        setMessages((prev) => prev.filter((m) => m.id !== streamingId));
      } else {
        // Persist completed turn to conversation history.
        apiHistoryRef.current = trimHistory([...history, { role: "user" as const, content: userMessage }, { role: "assistant" as const, content: assistantText }]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("[ChatPopup] send error:", error);
      setMessages((prev) => [...prev, makeMessage("assistant", t("ui.chat.encounteredError"))]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocale, isIndexing, performSearch, searchIndex, t]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // IME composition: don't send on Enter while composing (e.g., Japanese, Korean, Turkish)
      if (e.nativeEvent.isComposing) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return (
    <>
      <Backdrop
        open={open}
        sx={{ zIndex: 1200 }}
        onClick={onClose}
      />
      <StyledChatPopupPaper
        role="dialog"
        aria-label={t("ui.chat.aiAssistant")}
        aria-modal="true"
        aria-hidden={!open}
        className={open ? "open" : ""}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ p: 1.5, backgroundColor: "grey.800" }}
        >
          <StatusIndicator />
          <Typography
            variant="subtitle2"
            sx={{ ml: 1, flexGrow: 1 }}
          >
            {t("ui.chat.aiAssistant")}
          </Typography>
          <CloseButton onClick={onClose} />
        </Stack>

        <Stack
          ref={scrollContainerRef}
          sx={{ flex: 1, overflowY: "auto", p: 2 }}
          spacing={2}
        >
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}
            >
              <Typography
                variant="caption"
                color="grey.400"
              >
                {m.role === "user" ? t("ui.chat.senderYou") : t("ui.chat.senderAssistant")}
              </Typography>
              <Paper
                sx={{
                  px: 1.5,
                  py: 1,
                  mt: 0.5,
                  backgroundColor: "grey.700",
                  color: m.role === "user" ? "success.main" : "text.primary",
                  maxWidth: "90%",
                  overflow: "auto",
                }}
              >
                {m.role === "assistant" ?
                  <MarkdownRenderer content={m.text} />
                : m.text}
              </Paper>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>

        <Box sx={{ p: 2 }}>
          {isIndexing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CircularProgress
                size={16}
                thickness={3}
                color="primary"
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {t("ui.chat.indexingDocuments")}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              inputRef={inputRef}
              variant="outlined"
              hiddenLabel
              fullWidth
              multiline
              maxRows={3}
              value={draft}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={!open || isLoading || isIndexing}
              placeholder={
                isIndexing ? t("ui.chat.pleaseWaitIndexingDocuments")
                : isLoading ?
                  t("ui.chat.loadingPlaceholder")
                : t("ui.chat.placeholder")
              }
            />
            <IconButton
              onClick={send}
              disabled={!draft.trim() || isLoading || isIndexing || !open}
              aria-label={t("ui.chat.sendMessage")}
              color="primary"
              size="medium"
              sx={{ alignSelf: "flex-end", mb: 0.8, px: 1.4 }}
            >
              <span style={{ fontSize: 20 }}>➤</span>
            </IconButton>
          </Box>
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: "2px solid",
                  borderColor: "primary.main transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <span>{t("ui.chat.loading")}</span>
              </Typography>
              <IconButton
                onClick={handleStop}
                size="small"
                color="error"
                aria-label={t("ui.chat.stop")}
              >
                {t("ui.chat.stop")}
              </IconButton>
            </Box>
          )}
        </Box>
      </StyledChatPopupPaper>
    </>
  );
});
