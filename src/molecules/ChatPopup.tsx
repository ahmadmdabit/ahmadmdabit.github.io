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

const LLMModel = "openai/gpt-oss-120b:free";
const LLMModelContextWindow = 131000; // 131K

// const LLMModel = "openai/gpt-oss-120b";
// const LLMModelContextWindow = 131000; // 131K

// const LLMModel = "anthropic/claude-haiku-4-5";
// const LLMModelContextWindow = 200000; // 200K

// const LLMModel = "deepseek/deepseek-v4-flash";
// const LLMModelContextWindow = 1000000; // 1M

// const LLMModel = "z-ai/glm-4.7-flash";
// const LLMModelContextWindow = 128000; // 128K

// Conversation compaction constants (Developer 2 approach: background compaction with retry/queue)
const CompactionThresholdRatio = 0.75; // Trigger compaction when history exceeds 75% of context window
const CompactionMaxRetries = 3;
const CompactionRetryBaseDelayMs = 1000;

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

  interface ChatOptions {
    signal?: AbortSignal;
  }

  // interface StreamingChatOptions {
  //   signal?: AbortSignal;
  // }
}

puter.quiet = true;

interface UsageInfo {
  prompt: number;
  completion: number;
  inputCacheRead: number;
  request: number;
  billedUsage: number;
  usdCents: number;
}

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
    right: 2,
    width: "calc(100vw - 20px)",
    maxWidth: "none",
  },
  [theme.breakpoints.up("sm")]: {
    width: "50vw",
  },
}));

const SystemPrompt = `You are the official AI representative of Ahmet FATIHOGLU (Senior Software Developer & Architect). Your sole function is to answer questions about his professional background using ONLY the provided context documents (Resume, Projects) and the results of the \`expandSearch\` tool. 

## 1. NON-NEGOTIABLE CONSTRAINTS
- **Language Lock:** Look ONLY at the final user message. Respond EXCLUSIVELY in that language. Do NOT inherit language from the conversation history or summary.
- **Zero Fabrication (EVIDENCE TRACEABILITY):** You are strictly FORBIDDEN from stating or implying that Ahmet has hands-on professional or project experience with a technology unless a specific named project or professional job description in the context explicitly says he used or built it.
  - A term listed in the "TECHNICAL SKILLS" section is a listed skill, NOT project evidence.
  - A term listed in the "FAQ QUESTIONS" list is an FAQ topic, NOT project evidence. FAQ titles are questions, not proof of capability.
- **Fidelity to Frameworks:** Maintain perfect technical accuracy regarding framework platforms. Do NOT classify desktop-only frameworks (WPF, WinForms) as web applications, nor classify web-only technologies (HTML, CSS, React, Angular) as desktop applications.
- **Mobile Stack Mapping:** Dart and Flutter are explicitly mobile development technologies in Ahmet's stack. Mentioning Flutter or Dart development in his professional history (such as his role at HİTİT BİLGİ TEKNOLOJİLERİ) or professional summary is direct proof of mobile application experience.
- **No Tables:** Never use markdown tables. Use vertical bulleted lists or compact prose.
- **Conciseness & HARD STOP:** Lead with the direct answer (except when a brief procedural acknowledgment is required by Section 4). Omit filler phrases. Never append concluding summaries or analytical paragraphs (e.g., "This demonstrates that..."). Provide the facts and execute a HARD STOP.
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

// =============================================================================
// Developer 2: Background Conversation Compaction with Exponential Backoff & Queue
// =============================================================================

interface CompactionJob {
  id: number;
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  resolve: (compacted: Array<{ role: "user" | "assistant" | "system"; content: string }>) => void;
  reject: (error: Error) => void;
  attempt: number;
  timestamp: number;
}

/**
 * Developer 1: Context-specific lazy hydration for PII.
 * Only includes PII (email, phone, address) in resume when user explicitly
 * asks for contact information. Otherwise returns sanitized resume.
 */
const isContactInfoQuery = (query: string): boolean => {
  const normalized = query.toLowerCase();
  const contactKeywords = ["email", "e-posta", "mail", "phone", "telefon", "telephone", "mobile", "cep", "address", "adres", "location", "konum", "where", "nerede", "ikamet", "contact", "iletişim", "iletisim"];
  return contactKeywords.some((kw) => normalized.includes(kw));
};

const getContextWindow = (): number => LLMModelContextWindow;

/**
 * Parse a usage event from a Puter.js stream chunk.
 * Usage events arrive at the end of the stream with shape:
 *   { type: "usage", usage: { prompt, completion, input_cache_read, ... } }
 */
const parseUsageFromChunk = (part: unknown): UsageInfo | null => {
  if (part && typeof part === "object" && (part as { type?: string }).type === "usage" && (part as { usage?: unknown }).usage && typeof (part as { usage: object }).usage === "object") {
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

const buildCompactionPrompt = (history: Array<{ role: "user" | "assistant" | "system"; content: string }>): string => {
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
};

const compactHistoryWithLLM = async (history: Array<{ role: "user" | "assistant" | "system"; content: string }>, signal: AbortSignal): Promise<Array<{ role: "user" | "assistant" | "system"; content: string }>> => {
  const prompt = buildCompactionPrompt(history);

  try {
    const response = await puter.ai.chat(
      [
        { role: "system", content: "You are a professional conversation summarizer. Produce a concise factual summary preserving all specific details about the candidate's experience, projects, and skills." },
        { role: "user", content: prompt },
      ],
      {
        model: LLMModel,
        signal,
      },
    );
    console.log("response", response);

    const summaryText = typeof response === "string" ? response : ((response.message?.content as string) ?? "");

    if (!summaryText || summaryText.trim().length === 0) {
      throw new Error("Empty summary returned from LLM");
    }

    // Return compacted history: summary as a single system entry + last 2 turns
    const recentTurns = history.slice(-2);
    return [{ role: "system", content: `## PREVIOUS CONTEXT (Summary)\n${summaryText.trim()}` }, ...recentTurns];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new Error(`Compaction LLM call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const processCompactionQueue = async (
  queue: CompactionJob[],
  compactionQueueRef: React.RefObject<CompactionJob[]>,
  isHistorySummarizingRef: React.RefObject<boolean>,
  abortControllerRef: React.RefObject<AbortController | null>,
  setIsHistorySummarizing?: (value: boolean) => void,
): Promise<void> => {
  if (isHistorySummarizingRef.current || queue.length === 0) return;

  const job = queue[0];
  isHistorySummarizingRef.current = true;
  setIsHistorySummarizing?.(true);

  const controller = new AbortController();
  abortControllerRef.current = controller;

  try {
    const compacted = await compactHistoryWithLLM(job.history, controller.signal);
    job.resolve(compacted);
    queue.shift(); // Remove completed job
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      isHistorySummarizingRef.current = false;
      setIsHistorySummarizing?.(false);
      return;
    }

    job.attempt++;
    if (job.attempt <= CompactionMaxRetries) {
      // Exponential backoff
      const delay = CompactionRetryBaseDelayMs * Math.pow(2, job.attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
      // Re-queue for retry (will be picked up by next processCompactionQueue call)
    } else {
      job.reject(new Error(`Compaction failed after ${CompactionMaxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`));
      queue.shift(); // Remove failed job
    }
  } finally {
    isHistorySummarizingRef.current = false;
    setIsHistorySummarizing?.(false);
    // Process next in queue
    if (queue.length > 0) {
      queueMicrotask(() => processCompactionQueue(queue, compactionQueueRef, isHistorySummarizingRef, abortControllerRef, setIsHistorySummarizing));
    }
  }
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
  const apiHistoryRef = useRef<{ role: "user" | "assistant" | "system"; content: string }[]>([]);
  // Store loaded document content per locale to avoid mutating DocumentSources
  const loadedDocumentsRef = useRef<Record<"en" | "tr", LoadedDocument[]>>({ en: [], tr: [] });
  // Developer 2: Background compaction refs
  const compactionQueueRef = useRef<CompactionJob[]>([]);
  const isHistorySummarizingRef = useRef(false);
  const compactionAbortControllerRef = useRef<AbortController | null>(null);
  // Mirror refs to state for UI reactivity
  const [isHistorySummarizing, setIsHistorySummarizing] = useState(false);
  // Accumulated token usage from completed turns (for compaction threshold check)
  const tokenUsageRef = useRef<UsageInfo>({ prompt: 0, completion: 0, inputCacheRead: 0, request: 0, billedUsage: 0, usdCents: 0 });
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

  // Rough token estimate using 4 chars per token heuristic
  const estimateTokens = useCallback((text: string): number => Math.ceil(text.length / 4), []);

  // Developer 2: Check if compaction is needed and enqueue
  const checkAndEnqueueCompaction = useCallback(
    (history: Array<{ role: "user" | "assistant" | "system"; content: string }>) => {
      // Use REAL token usage from completed turns (prompt + input_cache_read)
      // This avoids heuristic estimation for the trigger decision
      const historyTokens = tokenUsageRef.current.prompt + tokenUsageRef.current.inputCacheRead;
      const contextWindow = getContextWindow();
      const threshold = contextWindow * CompactionThresholdRatio;

      if (historyTokens > threshold) {
        // Enqueue compaction job
        const job: CompactionJob = {
          id: Date.now(),
          history,
          resolve: (compacted) => {
            apiHistoryRef.current = compacted;
            // Reset token usage to reflect the new compacted history
            // Estimate tokens for the new compacted history
            const compactedTokens = compacted.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);
            tokenUsageRef.current = {
              prompt: Math.floor(compactedTokens * 0.6),
              completion: 0,
              inputCacheRead: Math.floor(compactedTokens * 0.4),
              request: 0,
              billedUsage: 0,
              usdCents: 0,
            };
          },
          reject: (error) => {
            console.error("[ChatPopup] Compaction failed:", error);
            // Fallback: simple truncation to last 2 turns
            apiHistoryRef.current = history.slice(-2);
          },
          attempt: 0,
          timestamp: Date.now(),
        };
        compactionQueueRef.current.push(job);
        // Process queue if not already processing
        if (!isHistorySummarizingRef.current) {
          queueMicrotask(() => processCompactionQueue(compactionQueueRef.current, compactionQueueRef, isHistorySummarizingRef, compactionAbortControllerRef, setIsHistorySummarizing));
        }
      }
    },
    [estimateTokens],
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
      // Developer 1: Context-specific lazy hydration for PII
      // Only include PII (email, phone, address) when user explicitly asks for contact info
      const resumeRaw = loadedDocs.find((d) => d.title === "Resume" || d.title === "Özgeçmiş")?.content.trim() ?? "";
      const resumeContent = isContactInfoQuery(userMessage) ? resumeRaw : stripPIIFromResume(resumeRaw);
      const projectsContent = loadedDocs.find((d) => d.title === "Projects" || d.title === "Projeler")?.content.trim() ?? "";
      const faqContent = loadedDocs.find((d) => d.title === "FAQ" || d.title === "SSS")?.content.trim() ?? "";
      const faqQuestions = extractFAQQuestions(faqContent);

      if (!resumeContent && !projectsContent && faqQuestions.length === 0) {
        apiHistoryRef.current = [...history, { role: "user" as const, content: userMessage }];
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

      const apiMessages: Array<ChatMessage> = [{ role: "system", content: baseSystemContent }, ...history, { role: "user", content: userMessage }];

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
      let turnUsage: UsageInfo = { prompt: 0, completion: 0, inputCacheRead: 0, request: 0, billedUsage: 0, usdCents: 0 };

      for await (const part of response) {
        if (abortControllerRef.current?.signal.aborted) {
          wasAborted = true;
          break;
        }

        // Parse usage event (arrives at end of stream)
        const usage = parseUsageFromChunk(part);
        if (usage) {
          turnUsage = usage;
        }

        // CRITICAL FIX: Explicitly drop reasoning tokens to prevent UI leakage
        if (part?.type === "reasoning") continue;

        //  && part.type !== "reasoning"
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

      // Accumulate this turn's usage into the running total
      if (!wasAborted) {
        tokenUsageRef.current.prompt += turnUsage.prompt;
        tokenUsageRef.current.inputCacheRead += turnUsage.inputCacheRead;
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

        const followUpMessages = [{ role: "system", content: expandedSystemContent }, ...history, { role: "user", content: userMessage }, toolCallMessage, toolResultMessage];

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

          // CRITICAL FIX: Explicitly drop reasoning tokens to prevent UI leakage
          if (finalPart?.type === "reasoning") continue;

          // && finalPart.type !== "reasoning"
          if (finalPart?.text) {
            assistantText += finalPart.text;
            setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
          }
        }
      }

      // Accumulate follow-up turn's usage
      if (!wasAborted) {
        tokenUsageRef.current.prompt += turnUsage.prompt;
        tokenUsageRef.current.inputCacheRead += turnUsage.inputCacheRead;
      }

      if (wasAborted) {
        // Remove the empty/partial assistant bubble that was added before
        // streaming started, so the UI doesn't show a blank message.
        setMessages((prev) => prev.filter((m) => m.id !== streamingId));
      } else {
        // Persist completed turn to conversation history.
        const newHistory = [...history, { role: "user" as const, content: userMessage }, { role: "assistant" as const, content: assistantText }];
        apiHistoryRef.current = newHistory;

        // Developer 2: Check if compaction is needed (background, non-blocking)
        checkAndEnqueueCompaction(newHistory);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("[ChatPopup] send error:", error);
      setMessages((prev) => [...prev, makeMessage("assistant", t("ui.chat.encounteredError"))]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocale, isIndexing, performSearch, searchIndex, t, checkAndEnqueueCompaction]);

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

  // Helper: Calculate usage percentage for the indicator
  const getUsagePercent = useCallback((): number => {
    const total = tokenUsageRef.current.prompt + tokenUsageRef.current.inputCacheRead;
    const window = getContextWindow();
    return Math.min(100, Math.round((total / window) * 100));
  }, []);

  const getUsageColor = useCallback((percent: number): "safe" | "warning" | "danger" => {
    if (percent >= 80) return "danger";
    if (percent >= 60) return "warning";
    return "safe";
  }, []);

  const formatTokenCount = useCallback((count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  }, []);

  // Usage Indicator Component — Shows context window utilization, token counts, model, compaction status
  const UsageIndicator = () => {
    const percent = getUsagePercent();
    const color = getUsageColor(percent);

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          px: 1.5,
          backgroundColor: "background.surface",
        }}
      >
        {/* Token Counts & Model */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 1, flexWrap: "wrap" }}>
          {/* Token counts */}
          {!isHistorySummarizing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
              >
                {t("ui.chat.usage.prompt") ?? "Prompt"}
              </Typography>
              <Typography
                variant="body2"
                color={
                  getUsageColor(getUsagePercent()) === "danger" ? "error.main"
                  : getUsageColor(getUsagePercent()) === "warning" ?
                    "warning.main"
                  : "success.main"
                }
                sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
              >
                {formatTokenCount(tokenUsageRef.current.prompt)}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
              >
                {t("ui.chat.usage.cache") ?? "Cache"}
              </Typography>
              <Typography
                variant="body2"
                color={
                  getUsageColor(getUsagePercent()) === "danger" ? "error.main"
                  : getUsageColor(getUsagePercent()) === "warning" ?
                    "warning.main"
                  : "success.main"
                }
                sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
              >
                {formatTokenCount(tokenUsageRef.current.inputCacheRead)}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
              >
                {t("ui.chat.usage.total") ?? "Total"}
              </Typography>
              <Typography
                variant="body2"
                color={
                  getUsageColor(getUsagePercent()) === "danger" ? "error.main"
                  : getUsageColor(getUsagePercent()) === "warning" ?
                    "warning.main"
                  : "success.main"
                }
                sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
              >
                {formatTokenCount(tokenUsageRef.current.prompt + tokenUsageRef.current.inputCacheRead)} / {formatTokenCount(getContextWindow())}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
              >
                {t("ui.chat.usage.percent") ?? "Usage"}
              </Typography>
              <Typography
                variant="body2"
                color={
                  color === "danger" ? "error.main"
                  : color === "warning" ?
                    "warning.main"
                  : "success.main"
                }
                sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
              >
                {getUsagePercent()}%
              </Typography>
            </Box>
          )}

          {/* Model badge + compaction status */}
          {isHistorySummarizing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* 
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  backgroundColor: "background.card",
                  border: "1px solid",
                  borderColor: "border.default",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 300, fontSize: "0.75rem" }}
                >
                  {LLMModel.split("/").pop() || LLMModel}
                </Typography>
              </Box> 
            */}

              {isHistorySummarizing && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    backgroundColor: "usage.cache",
                    color: "text.primary",
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <CircularProgress
                    size={12}
                    thickness={3}
                    color="primary"
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {t("ui.chat.historySummarizing")}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

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
                <MarkdownRenderer content={m.text} />
              </Paper>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>

        <Box sx={{ p: 2 }}>
          {(isIndexing || isLoading) && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
              <CircularProgress
                size={16}
                thickness={3}
                color="primary"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {isIndexing && t("ui.chat.indexingDocuments")}
                {isLoading && t("ui.chat.loading")}
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
            {!isLoading && (
              <IconButton
                onClick={send}
                disabled={!draft.trim() || isLoading || isIndexing || !open}
                aria-label={t("ui.chat.sendMessage")}
                title={t("ui.chat.sendMessage")}
                color="primary"
                size="medium"
                sx={{ alignSelf: "flex-end", mb: 1.1, px: 1.4 }}
              >
                <span style={{ fontSize: 20 }}>➤</span>
              </IconButton>
            )}
            {isLoading && (
              <IconButton
                onClick={handleStop}
                size="small"
                color="error"
                aria-label={t("ui.chat.stop")}
                title={t("ui.chat.stop")}
              >
                {t("ui.chat.stop")}
              </IconButton>
            )}
          </Box>

          {/* Usage Info Indicator — Context window utilization, token counts, model, compaction status */}
          <Box sx={{ mt: 1 }}>
            <UsageIndicator />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 0.5, fontSize: "0.70em", mt: 0.6, mb: -0.8 }}
            >
              {t("ui.chat.aIMayMakeMistakes")}
            </Typography>
          </Box>
        </Box>
      </StyledChatPopupPaper>
    </>
  );
});
