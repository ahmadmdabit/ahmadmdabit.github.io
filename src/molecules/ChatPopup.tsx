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
import MiniSearch from "minisearch";
import { marked } from "marked";
import { StatusIndicator } from "@/atoms/StatusIndicator";
import { CloseButton } from "@/atoms/CloseButton";

const LLMModel = "openai/gpt-oss-120b:free";
// const LLMModel = "openai/gpt-oss-120b",
// const LLMModel = "anthropic/claude-haiku-4-5",
// const LLMModel = "deepseek/deepseek-v4-flash",
// const LLMModel = "z-ai/glm-4.7-flash",

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
- **Be specific and detailed** — draw from the context to provide concrete examples, technologies, and outcomes.
- **Use the same language** as the user's question (English or Turkish).
- **Never fabricate** information not present in the context documents.
- **Keep responses focused** — don't add unnecessary filler or disclaimers.
- **Avoid outputing tables** - as much as possible prefer to avoid responsing with tables. Respond with alternatives like formated vertical list.

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

const DocumentSources = {
  en: [
    { path: "/data/Resume-EN.md", title: "Resume", locale: "en", content: "" },
    { path: "/data/Projects-EN.md", title: "Projects", locale: "en", content: "" },
    { path: "/data/FAQ-EN.md", title: "FAQ", locale: "en", content: "" },
  ],
  tr: [
    { path: "/data/Resume-TR.md", title: "Özgeçmiş", locale: "tr", content: "" },
    { path: "/data/Projects-TR.md", title: "Projeler", locale: "tr", content: "" },
    { path: "/data/FAQ-TR.md", title: "SSS", locale: "tr", content: "" },
  ],
};

const makeMessage = (role: MessageRole, text: string): Message => ({
  id: crypto.randomUUID(),
  role,
  text,
});

const chunkDocument = (content: string, source: string, locale: string): DocumentChunk[] => {
  const chunks: DocumentChunk[] = [];

  // Special handling for FAQ files: one chunk per question
  if (source === "FAQ" || source === "SSS") {
    return chunkFAQDocument(content, source, locale);
  }

  // Standard chunking for Resume and Projects: split by headings
  const sections = content.split(/\n##?\s+/).filter(Boolean);

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
  const questionPattern = /\*\*(\d+)\.\s+([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*+\d+\.|$)/g;

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
  const questionPattern = /\*\*(\d+)\.\s+([^*]+)\*\*\s*\n/g;
  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    questions.push(`${match[1]}. ${match[2].trim()}`);
  }
  return questions;
};

const loadAndIndexDocuments = async (locale: string): Promise<SearchIndex> => {
  const sources = DocumentSources[locale as keyof typeof DocumentSources] || DocumentSources.en;
  const allChunks: DocumentChunk[] = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.path);
      if (response.ok) {
        const content = await response.text();
        source.content = content;
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

  return { miniSearch, documents: allChunks };
};

const MarkdownRenderer = memo(({ content }: { content: string }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await marked.parse(content, { async: true });
      if (!cancelled) setHtml(DOMPurify.sanitize(raw));
    })();
    return () => {
      cancelled = true;
    };
  }, [content]);

  return <Box component="div" sx={{ "& p": { m: 0 }, "& code": { fontFamily: "monospace" } }} dangerouslySetInnerHTML={{ __html: html }} />;
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
  const inputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const currentLocale = i18n.language.startsWith("tr") ? "tr" : "en";

  useEffect(() => {
    if (open && !isIndexing && !searchIndex) {
      setIsIndexing(true);
      Promise.all([loadAndIndexDocuments("en"), loadAndIndexDocuments("tr")])
        .then(([enIndex, trIndex]) => {
          const allDocs = [...enIndex.documents, ...trIndex.documents];
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
          setIsIndexing(false);
        })
        .catch(() => setIsIndexing(false));
    }
  }, [isIndexing, open, searchIndex]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const initialMsg = makeMessage("assistant", t("ui.chat.initialMessage"));
      setMessages([initialMsg]);
      apiHistoryRef.current = [{ role: "assistant", content: initialMsg.text }];
    }
  }, [messages.length, open, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 220);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [open]);

  const performSearch = useCallback(
    (query: string, fuzzy: number, maxResults: number, localeFilter: "same" | "all"): string | null => {
      if (!searchIndex) return null;

      const results = searchIndex.miniSearch.search(query, {
        boost: { title: 2 },
        fuzzy,
        prefix: true,
      });

      const filtered = localeFilter === "same" ? results.filter((r) => r.locale === currentLocale) : results;

      const top = filtered.slice(0, maxResults);

      if (top.length === 0) return null;

      return top.map((r) => `[Source: ${r.source}]\n${r.text}`).join("\n\n---\n\n");
    },
    [searchIndex, currentLocale],
  );

  const send = useCallback(async () => {
    if (!draft.trim() || !searchIndex || isIndexing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = draft.trim().slice(0, 2000);
    const history = apiHistoryRef.current;
    setMessages((prev) => [...prev, makeMessage("user", userMessage)]);
    setDraft("");
    setIsLoading(true);

    try {
      // Step 1: Initial strict search
      // const initialContext = performSearch(userMessage, 0.2, 5, "same");
      const faqQuestions = extractFAQQuestions(DocumentSources[currentLocale][2].content);
      const initialContext = `RESUME:
${DocumentSources[currentLocale][0].content}

ALL PROJECTS:
${DocumentSources[currentLocale][1].content}

FAQ QUESTIONS (use expandSearch tool to get the full answer for any matching question):
${faqQuestions.join("\n")}`;

      if (!initialContext) {
        // No results at all — inform the user immediately
        apiHistoryRef.current = [...history, { role: "user" as const, content: userMessage }];
        setMessages((prev) => [...prev, makeMessage("assistant", t("ui.chat.noRelevantInformationFoundInTheDocuments"))]);
        return;
      }

      // Define the expandSearch tool for the LLM
      const tools = [
        {
          type: "function" as const,
          function: {
            name: "expandSearch",
            description: "Perform an expanded document search with relaxed parameters when the initial context is insufficient or partially relevant. Call this when you need more information to answer the user's question. Returns additional document chunks that may contain relevant information.",
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

      // Step 2: Call AI with stream AND tools
      const response = await puter.ai.chat(apiMessages, {
        tools,
        stream: true,
        verbosity: "low", // OpenAI models only.
        // reasoning: {
        //   effort: "minimal", // OpenAI models only.
        // },
        model: LLMModel,
      });

      // Stream handling with tool call detection
      const assistantMessage = makeMessage("assistant", "");
      setMessages((prev) => [...prev, assistantMessage]);
      const streamingId = assistantMessage.id;

      let assistantText = "";
      let pendingToolCall: { id: string; name: string; input: { query: string; searchType: string } } | null = null;

      for await (const part of response) {
        if (abortControllerRef.current?.signal.aborted) break;

        // Standard text stream
        if (part?.text) {
          assistantText += part.text;
          setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
        }

        // Tool call detected
        if (part?.type === "tool_use") {
          pendingToolCall = {
            id: part.id!,
            name: part.name!,
            input: part.input as { query: string; searchType: string },
          };
        }
      }

      // Step 3: If LLM requested expanded search, execute it
      if (pendingToolCall && pendingToolCall.name === "expandSearch") {
        const { query: expandedQuery, searchType: searchType } = pendingToolCall.input;

        const fuzzy = searchType === "crossLocale" ? 0.3 : 0.4;
        const maxResults = searchType === "crossLocale" ? 8 : 10;
        const localeFilter = searchType === "crossLocale" ? "all" : "same";

        const expandedContext = performSearch(expandedQuery, fuzzy, maxResults, localeFilter);

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

        const finalResponse = await puter.ai.chat(followUpMessages, {
          stream: true,
          verbosity: "low",
          model: LLMModel,
        });

        // Reset and stream the final response
        assistantText = "";
        for await (const finalPart of finalResponse) {
          if (abortControllerRef.current?.signal.aborted) break;
          if (finalPart?.text) {
            assistantText += finalPart.text;
            setMessages((prev) => prev.map((m) => (m.id === streamingId ? { ...m, text: assistantText } : m)));
          }
        }
      }

      apiHistoryRef.current = [...history, { role: "user" as const, content: userMessage }, { role: "assistant" as const, content: assistantText }];
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("[ChatPopup] send error:", error);
      setMessages((prev) => [...prev, makeMessage("assistant", t("ui.chat.encounteredError"))]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocale, draft, isIndexing, performSearch, searchIndex, t]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      <Backdrop open={open} sx={{ zIndex: 1200 }} onClick={onClose} />
      <StyledChatPopupPaper role="dialog" aria-label={t("ui.chat.aiAssistant")} aria-modal="false" className={open ? "open" : ""}>
        <Stack direction="row" alignItems="center" sx={{ p: 1.5, backgroundColor: "grey.800" }}>
          <StatusIndicator />
          <Typography variant="subtitle2" sx={{ ml: 1, flexGrow: 1 }}>
            {t("ui.chat.aiAssistant")}
          </Typography>
          <CloseButton onClick={onClose} />
        </Stack>

        <Stack sx={{ flex: 1, overflowY: "auto", p: 2 }} spacing={2}>
          {messages.map((m) => (
            <Box key={m.id} sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
              <Typography variant="caption" color="grey.400">
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
                {m.role === "assistant" ? <MarkdownRenderer content={m.text} /> : m.text}
              </Paper>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>

        <Box sx={{ p: 2 }}>
          {isIndexing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CircularProgress size={16} thickness={3} color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t("ui.chat.indexingDocuments")}
              </Typography>
            </Box>
          )}

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
            disabled={isLoading || isIndexing}
            placeholder={isIndexing ? t("ui.chat.pleaseWaitIndexingDocuments") : isLoading ? t("ui.chat.loadingPlaceholder") : t("ui.chat.placeholder")}
          />
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
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{t("ui.chat.loading")}</span>
              </Typography>
              <IconButton onClick={handleStop} size="small" color="error" aria-label={t("ui.chat.stop")}>
                {t("ui.chat.stop")}
              </IconButton>
            </Box>
          )}
        </Box>
      </StyledChatPopupPaper>
    </>
  );
});
