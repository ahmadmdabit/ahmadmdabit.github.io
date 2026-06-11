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
}