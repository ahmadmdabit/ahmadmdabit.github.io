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

    interface ChatOptions {
        signal?: AbortSignal;
    }

    // interface StreamingChatOptions {
    //   signal?: AbortSignal;
    // }
}