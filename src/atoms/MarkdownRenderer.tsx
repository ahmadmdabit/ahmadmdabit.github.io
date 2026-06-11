import { useState, useEffect, memo } from "react";
import Box from "@mui/material/Box";
import { marked } from "marked";
import DOMPurify from "dompurify";

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

export default MarkdownRenderer;
