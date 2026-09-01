// Chat feature constants
// Extracted from ChatPopup.tsx for reuse across hooks and components

import type { DocumentSource } from "@/types/Chat.types";

const K128 = 128000;
const K131 = 131000;
const K197 = 197000;
const K200 = 200000;
const K256 = 256000;
const K262 = 262000;
const K512 = 512000;
const M1 = 1000000;

export const AvailableLLMModels = {
  DOTS3NOTEPREVIEWFREE: { order: 12, model: "dots-studio/dots-3-note-preview:free", context: K512, isFree: true },
  LAGUNAS21FREE: { order: 13, model: "poolside/laguna-s-2.1:free", context: K262, isFree: true }, // $0.09 / $0.18
  DEEPSEEKV4FLASHFREE: { order: 3, model: "deepseek/deepseek-v4-flash:free", context: M1, isFree: true }, // $0.14 / $0.28
  HY3FREE: { order: 4, model: "tencent/hy3:free", context: K262, isFree: true }, // $0.13 / $0.53
  NEMOTRON35LIGHTNINGFREE: { order: 5, model: "nvidia/nemotron-3.5-lightning:free", context: M1, isFree: true }, // $0.08 / $0.2
  GEMMA431BITFREE: { order: 6, model: "google/gemma-4-31b-it:free", context: K262, isFree: true }, // $0.13 / $0.38
  NEMOTRON3SUPER120BA12BFREE: { order: 7, model: "nvidia/nemotron-3-super-120b-a12b:free", context: K262, isFree: true }, // $0.1 / $0.5

  NEMOTRON3NANOOMNI30BA3BREASONINGFREE: { order: 8, model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", context: K256, isFree: true },
  NORTHMINICODEFREE: { order: 9, model: "cohere/north-mini-code:free", context: K256, isFree: true },
  NEMOTRON3NANO30BA3BFREE: { order: 10, model: "nvidia/nemotron-3-nano-30b-a3b:free", context: K256, isFree: true }, // $0.05 / $0.2
  QWEN3827BFREE: { order: 11, model: "qwen/qwen3.8-27b:free", context: K131, isFree: true }, // $0.21 / $0.85
  MINIMAXM3FREE: { order: 1, model: "minimax/minimax-m3:free", context: M1, isFree: true }, // $0.28 / $1.1
  MINIMAXM27FREE: { order: 2, model: "minimax/minimax-m2.7:free", context: K197, isFree: true }, // $0.25 / $1
  NEMOTRON3ULTRA550BA55BFREE: { order: 14, model: "nvidia/nemotron-3-ultra-550b-a55b:free", context: M1, isFree: true }, // $0.5 / $2.5
  GPTOSS120BFREE: { order: 15, model: "openai/gpt-oss-120b:free", context: K131, isFree: true, },

  GLM53FLASH: { order: 16, model: "z-ai/glm-5.3-flash", context: M1, isFree: false }, // $0.08 / $0.25
  DEEPSEEKV4FLASH0731: { order: 17, model: "deepseek-ai/deepseek-v4-flash-0731", context: M1, isFree: false }, // $0.14 / $0.28
  DEEPSEEKV4FLASH: { order: 18, model: "deepseek/deepseek-v4-flash", context: M1, isFree: false }, // $0.14 / $0.28
  QWEN38FLASH: { order: 19, model: "qwen/qwen3.8-flash", context: M1, isFree: false }, // $0.14 / $0.42
  GPTOSS120B: { order: 20, model: "openai/gpt-oss-120b", context: K131, isFree: false, }, // $0.04 / $0.17
  GLM47FLASH: { order: 21, model: "z-ai/glm-4.7-flash", context: K128, isFree: false }, // $0.06 / $0.4
  CLAUDEHAIKU45: { order: 22, model: "anthropic/claude-haiku-4-5", context: K200, isFree: false }, // $1 / $5
};

export const LLMModel = AvailableLLMModels.LAGUNAS21FREE.model;
export const LLMModelContextWindow = AvailableLLMModels.LAGUNAS21FREE.context;

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
