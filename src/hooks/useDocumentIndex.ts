import { useState, useEffect, useRef, useCallback } from "react";
import MiniSearch from "minisearch";
import type { DocumentSource, DocumentChunk, LoadedDocument, SearchIndex } from "../types/Chat.types";

interface DocumentSources {
  readonly en: DocumentSource[];
  readonly tr: DocumentSource[];
}

interface UseDocumentIndexOptions {
  /** Document sources per locale */
  documentSources: DocumentSources;
  /** Whether to start indexing immediately */
  autoIndex?: boolean;
  /** Locale to index (or 'all' for both) */
  locale?: "en" | "tr" | "all";
}

/** FAQ-specific MiniSearch index for fast exact-match search */
interface FAQSearchIndex {
  miniSearch: MiniSearch<DocumentChunk>;
  documents: DocumentChunk[];
}

interface UseDocumentIndexReturn {
  /** Current search index (merged across locales) */
  searchIndex: SearchIndex | null;
  /** Pre-built FAQ search indexes per locale */
  faqSearchIndexes: Record<"en" | "tr", FAQSearchIndex | null>;
  /** Loaded documents per locale */
  loadedDocuments: Record<"en" | "tr", LoadedDocument[]>;
  /** Whether indexing is in progress */
  isIndexing: boolean;
  /** Error if indexing failed */
  error: Error | null;
  /** Trigger indexing manually */
  indexDocuments: () => Promise<void>;
}

/**
 * Hook to load, chunk, and index documents for search.
 * Handles both locales and merges into a single search index.
 * Also builds dedicated FAQ indexes for fast exact-match search.
 */
export const useDocumentIndex = (options: UseDocumentIndexOptions): UseDocumentIndexReturn => {
  const { documentSources, autoIndex = true, locale = "all" } = options;

  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedDocuments, setLoadedDocuments] = useState<Record<"en" | "tr", LoadedDocument[]>>({ en: [], tr: [] });
  const [faqSearchIndexes, setFaqSearchIndexes] = useState<Record<"en" | "tr", FAQSearchIndex | null>>({ en: null, tr: null });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Chunking functions (pure, could be extracted to utils)
  // Defined first to avoid hoisting issues
  const chunkFAQDocument = useCallback((content: string, source: string, locale: string): DocumentChunk[] => {
    const chunks: DocumentChunk[] = [];
    const questionPattern = /^\*\*(\d+)\.\s+(.+?)\*\*\s*\r?\n([\s\S]*?)(?=^\*\*\d+\.\s+.+?\*\*\s*$|$)/gm;

    let match;
    while ((match = questionPattern.exec(content)) !== null) {
      const questionNum = match[1];
      const questionText = match[2].trim();
      const answerText = match[3].trim();

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
  }, []);

  const chunkDocument = useCallback((content: string, source: string, locale: string): DocumentChunk[] => {
    const chunks: DocumentChunk[] = [];

    if (source === "FAQ" || source === "SSS") {
      return chunkFAQDocument(content, source, locale);
    }

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
  }, [chunkFAQDocument]);

  const loadAndIndexDocuments = useCallback(
    async (targetLocale: "en" | "tr"): Promise<{ 
      searchIndex: SearchIndex; 
      loadedDocs: LoadedDocument[]; 
      faqChunks: DocumentChunk[] 
    }> => {
      const sources = documentSources[targetLocale];
      const allChunks: DocumentChunk[] = [];
      const faqChunks: DocumentChunk[] = [];
      const loadedDocs: LoadedDocument[] = [];

      for (const source of sources) {
        try {
          const response = await fetch(source.path);
          if (response.ok) {
            const content = await response.text();
            loadedDocs.push({ path: source.path, title: source.title, locale: source.locale, content });
            const chunks = chunkDocument(content, source.title, source.locale);
            allChunks.push(...chunks);
            // Collect FAQ chunks separately
            if (source.title === "FAQ" || source.title === "SSS") {
              faqChunks.push(...chunks);
            }
          }
        } catch (err) {
          console.error(`Failed to load ${source.path}:`, err);
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

      return { searchIndex: { miniSearch, documents: allChunks }, loadedDocs, faqChunks };
    },
    [documentSources, chunkDocument],
  );

  const indexDocuments = useCallback(async () => {
    if (isIndexing) return;

    setIsIndexing(true);
    setError(null);

    try {
      const localesToIndex: ("en" | "tr")[] = locale === "all" ? ["en", "tr"] : [locale];
      const results = await Promise.all(localesToIndex.map((l) => loadAndIndexDocuments(l)));

      if (!isMountedRef.current) return;

      const allDocs = results.flatMap((r) => r.searchIndex.documents);
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

      // Build FAQ-specific indexes per locale
      const newFaqIndexes: Record<"en" | "tr", FAQSearchIndex | null> = { en: null, tr: null };
      results.forEach((r, i) => {
        const loc = localesToIndex[i] as "en" | "tr";
        if (r.faqChunks.length > 0) {
          const faqMiniSearch = new MiniSearch<DocumentChunk>({
            fields: ["title", "text"],
            storeFields: ["title", "text", "source", "locale"],
            searchOptions: {
              boost: { title: 3 },
              fuzzy: 0.1, // tighter fuzzy for FAQ
              prefix: true,
            },
          });
          faqMiniSearch.addAll(r.faqChunks);
          newFaqIndexes[loc] = { miniSearch: faqMiniSearch, documents: r.faqChunks };
        }
      });
      setFaqSearchIndexes(newFaqIndexes);

      const newLoadedDocs: Record<"en" | "tr", LoadedDocument[]> = { en: [], tr: [] };
      results.forEach((r, i) => {
        const loc = localesToIndex[i] as "en" | "tr";
        newLoadedDocs[loc] = r.loadedDocs;
      });
      setLoadedDocuments(newLoadedDocs);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setIsIndexing(false);
      }
    }
  }, [isIndexing, locale, loadAndIndexDocuments]);

  // Auto-index on mount/options change
  const isAutoIndexingRef = useRef(false);

  // Reset auto-indexing guard when indexing completes (success or failure)
  useEffect(() => {
    if (!isIndexing) {
      isAutoIndexingRef.current = false;
    }
  }, [isIndexing]);

  useEffect(() => {
    if (autoIndex && !searchIndex && !isIndexing && !isAutoIndexingRef.current) {
      isAutoIndexingRef.current = true;
      indexDocuments();
    }
  }, [autoIndex, searchIndex, isIndexing, indexDocuments]);

  return {
    searchIndex,
    faqSearchIndexes,
    loadedDocuments,
    isIndexing,
    error,
    indexDocuments,
  };
};
