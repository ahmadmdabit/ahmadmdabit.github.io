import { useCallback, useRef, useEffect } from "react";
import MiniSearch from "minisearch";
import type { SearchIndex, DocumentChunk } from "../types/Chat.types";

/** FAQ-specific MiniSearch index for fast exact-match search */
export interface FAQSearchIndex {
  miniSearch: MiniSearch<DocumentChunk>;
  documents: DocumentChunk[];
}

interface UseSearchOptions {
  /** The search index to query */
  searchIndex: SearchIndex | null;
  /** Pre-built FAQ search indexes per locale */
  faqSearchIndexes: Record<"en" | "tr", FAQSearchIndex | null>;
  /** Current locale for filtering */
  locale: "en" | "tr";
}

interface UseSearchReturn {
  /** General search with configurable parameters */
  performSearch: (
    query: string,
    fuzzy?: number,
    maxResults?: number,
    localeFilter?: "same" | "crossLocale" | "all",
  ) => string | null;
  /** Dedicated FAQ search - exact/near-exact match against FAQ questions */
  searchFAQ: (query: string) => string | null;
}

/**
 * Hook to perform document searches.
 * Provides both general MiniSearch and dedicated FAQ search (uses pre-built index).
 */
export const useSearch = (options: UseSearchOptions): UseSearchReturn => {
  const { searchIndex, faqSearchIndexes, locale } = options;

  // Use ref to avoid recreating performSearch when searchIndex changes
  const searchIndexRef = useRef(searchIndex);
  useEffect(() => {
    searchIndexRef.current = searchIndex;
  }, [searchIndex]);

  const performSearch = useCallback(
    (
      query: string,
      fuzzy = 0.2,
      maxResults = 5,
      localeFilter: "same" | "crossLocale" | "all" = "same",
    ): string | null => {
      const currentSearchIndex = searchIndexRef.current;
      if (!currentSearchIndex) return null;

      const results = currentSearchIndex.miniSearch.search(query, {
        boost: { title: 2 },
        fuzzy,
        prefix: true,
      });

      let filtered: typeof results;
      if (localeFilter === "same") {
        filtered = results.filter((r) => r.locale === locale);
      } else if (localeFilter === "crossLocale") {
        const otherLocale = locale === "en" ? "tr" : "en";
        filtered = results.filter((r) => r.locale === otherLocale);
      } else {
        filtered = results;
      }

      const top = filtered.slice(0, maxResults);

      if (top.length === 0) return null;

      return top.map((r) => `[Source: ${r.source}]\n${r.text}`).join("\n\n---\n\n");
    },
    [locale],
  );

  const searchFAQ = useCallback(
    (query: string): string | null => {
      const faqIndex = faqSearchIndexes[locale];
      if (!faqIndex) return null;

      const results = faqIndex.miniSearch.search(query);
      if (results.length === 0) return null;

      const top = results.slice(0, 3);
      return top.map((r) => `[Source: ${r.source}]\n${r.text}`).join("\n\n---\n\n");
    },
    [faqSearchIndexes, locale],
  );

  return { performSearch, searchFAQ };
};
