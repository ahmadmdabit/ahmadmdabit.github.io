// Chat feature constants
// Extracted from ChatPopup.tsx for reuse across hooks and components

import type { DocumentSource } from "@/types/Chat.types";

export const AvailableLLMModels = {
  GPTOSS102BFREE: { Model: "openai/gpt-oss-120b:free", Context: 131000 }, // 131K
  GPTOSS102B: { Model: "openai/gpt-oss-120b", Context: 131000 }, // 131K
  CLAUDEHAIKU45: { Model: "anthropic/claude-haiku-4-5", Context: 200000 }, // 200K
  DEEPSEEKV4FLASH: { Model: "deepseek/deepseek-v4-flash", Context: 1000000 }, // 1M
  GLM47FLASH: { Model: "z-ai/glm-4.7-flash", Context: 128000 }, // 128K
};

export const LLMModel = AvailableLLMModels.GPTOSS102BFREE.Model;
export const LLMModelContextWindow = AvailableLLMModels.GPTOSS102BFREE.Context;

// Conversation compaction constants (background compaction with retry/queue)
export const CompactionThresholdRatio = 0.75; // Trigger compaction when history exceeds 75% of context window
export const CompactionMaxRetries = 3;
export const CompactionRetryBaseDelayMs = 1000;

export const DocumentSources: { readonly en: DocumentSource[]; readonly tr: DocumentSource[] } = {
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
