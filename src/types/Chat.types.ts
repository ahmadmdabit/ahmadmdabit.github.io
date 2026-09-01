import MiniSearch from "minisearch";

export interface UsageInfo {
    prompt: number;
    completion: number;
    inputCacheRead: number;
    request: number;
    billedUsage: number;
    usdCents: number;
}

export interface DocumentChunk {
    id: string;
    title: string;
    text: string;
    source: string;
    locale: string;
}

export interface SearchIndex {
    miniSearch: MiniSearch<DocumentChunk>;
    documents: DocumentChunk[];
}

export type MessageRole = "user" | "assistant";

export interface Message {
    id: string;
    role: MessageRole;
    text: string;
}

export interface DocumentSource {
    readonly path: string;
    readonly title: string;
    readonly locale: string;
}

export interface LoadedDocument extends DocumentSource {
    content: string;
}

export interface CompactionJob {
    id: number;
    history: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    resolve: (compacted: Array<{ role: "user" | "assistant" | "system"; content: string }>) => void;
    reject: (error: Error) => void;
    attempt: number;
    timestamp: number;
    /** Token usage at the time of compaction for history reset */
    tokenUsage: UsageInfo;
}

export interface FallbackModel {
    model: string;
    context: number;
    isFree: boolean;
    order: number;
}

/**
 * Fallback state. The owner (useConversationHistory) creates it once via
 * getInitialFallbackState and passes it by reference. Fields are READ-ONLY at
 * the type level: mutation of `pinnedIndex` (and `models`) happens ONLY inside
 * ModelFallback, which casts away the readonly qualifier at its single
 * mutation point (pinModel / advancePinOnError). Consumers therefore cannot
 * write to it without an explicit, greppable cast.
 * Note: because chat and compaction share this state, a fallback triggered by
 * background compaction can re-pin the chat model — accepted trade-off so both
 * paths share the "known good" model.
 */
export interface FallbackState {
    readonly models: readonly FallbackModel[];
    readonly pinnedIndex: number;
}
