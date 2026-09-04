import "@heyputer/puter.js";

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

    // NOTE (puter.js 2.6): upstream ChatOptions is a `type` alias, so an
    // `interface` of the same name cannot merge with it — it silently becomes
    // a SEPARATE type and breaks `as ChatOptions` casts (TS2769). Extend via
    // intersection instead. The SDK ignores `signal` at runtime (it whitelists
    // driver params in chat.js); abort stays cooperative (signal.aborted checks
    // between chunks + isAbort guards).
    export type ChatOptionsWithSignal = ChatOptions & {
        signal?: AbortSignal;
    };

    // interface StreamingChatOptions {
    //   signal?: AbortSignal;
    // }
}