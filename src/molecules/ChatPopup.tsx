import { memo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import puter from "@heyputer/puter.js";
import { StatusIndicator } from "@/atoms/StatusIndicator";
import { CloseButton } from "@/atoms/CloseButton";
import MarkdownRenderer from "@/atoms/MarkdownRenderer";
import ChatUsageIndicator from "@/atoms/ChatUsageIndicator";
import { DocumentSources } from "@/constants/chat";
import { LLMModel, LLMModelContextWindow, CompactionThresholdRatio, CompactionMaxRetries, CompactionRetryBaseDelayMs } from "@/constants/chat";
import { useKeyboardShortcuts, useDocumentIndex, useConversationHistory } from "@/hooks";

puter.quiet = true;

const StyledChatPopupPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  position: "fixed",
  top: 64,
  right: 14,
  bottom: 14,
  maxWidth: 620,
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
    right: 2,
    width: "calc(100vw - 20px)",
    maxWidth: "none",
  },
  [theme.breakpoints.up("sm")]: {
    width: "80vw",
  },
  [theme.breakpoints.up("md")]: {
    width: "50vw",
  },
}));

export const ChatPopup: React.FC<{ open: boolean; onClose: () => void }> = memo(({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language.startsWith("tr") ? "tr" : "en";
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Document indexing hook
  const { searchIndex, loadedDocuments, isIndexing, faqSearchIndexes } = useDocumentIndex({
    documentSources: DocumentSources,
    autoIndex: true,
    locale: "all",
  });

  // Conversation history hook
  const { messages, draft, isLoading, isHistorySummarizing, tokenUsage, contextWindow, send, handleChange, handleKeyDown, handleStop, scrollContainerRef, bottomRef } = useConversationHistory({
    locale: currentLocale,
    searchIndex,
    loadedDocuments,
    model: LLMModel,
    contextWindow: LLMModelContextWindow,
    compactionThresholdRatio: CompactionThresholdRatio,
    compactionMaxRetries: CompactionMaxRetries,
    compactionRetryBaseDelayMs: CompactionRetryBaseDelayMs,
    t,
    isIndexing,
    faqSearchIndexes,
  });

  // Stable send ref for keyboard shortcuts - avoids recreating useKeyboardShortcuts handleKeyDown
  // when send callback identity changes (which happens when searchIndex, loadedDocuments, etc. change)
  const sendRef = useRef(send);
  sendRef.current = send;
  const stableSend = useCallback(() => sendRef.current(), []);

  // Keyboard shortcuts (Escape to close)
  useKeyboardShortcuts({
    onEscape: onClose,
    onEnter: stableSend,
    focusRef: inputRef,
    enabled: open,
  });

  return (
    <>
      <Backdrop
        open={open}
        sx={{ zIndex: 1200 }}
        onClick={onClose}
      />
      <StyledChatPopupPaper
        role="dialog"
        aria-label={t("ui.chat.aiAssistant")}
        aria-modal="true"
        aria-hidden={!open}
        className={open ? "open" : ""}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ p: 1.5, backgroundColor: "grey.800" }}
        >
          <StatusIndicator />
          <Typography
            variant="subtitle2"
            sx={{ ml: 1, flexGrow: 1 }}
          >
            {t("ui.chat.aiAssistant")}
          </Typography>
          <CloseButton onClick={onClose} />
        </Stack>

        <Stack
          ref={scrollContainerRef}
          sx={{ flex: 1, overflowY: "auto", p: 2 }}
          spacing={2}
        >
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{ maxWidth: "90%", alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}
            >
              <Typography
                variant="caption"
                color="grey.400"
              >
                {m.role === "user" ? t("ui.chat.senderYou") : t("ui.chat.senderAssistant")}
              </Typography>
              <Paper
                sx={{
                  px: 1.5,
                  py: 1,
                  mt: 0.5,
                  backgroundColor: "grey.700",
                  color: m.role === "user" ? "success.main" : "text.primary",
                  overflow: "auto",
                }}
              >
                <MarkdownRenderer content={m.text} />
              </Paper>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>

        <Box sx={{ p: 2 }}>
          {(isIndexing || isLoading) && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
              <CircularProgress
                size={16}
                thickness={3}
                color="primary"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {isIndexing && t("ui.chat.indexingDocuments")}
                {isLoading && t("ui.chat.loading")}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
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
              disabled={!open || isLoading || isIndexing}
              placeholder={
                isIndexing ? t("ui.chat.pleaseWaitIndexingDocuments")
                : isLoading ?
                  t("ui.chat.loadingPlaceholder")
                : t("ui.chat.placeholder")
              }
            />
            {!isLoading && (
              <IconButton
                onClick={send}
                disabled={!draft.trim() || isLoading || isIndexing || !open}
                aria-label={t("ui.chat.sendMessage")}
                title={t("ui.chat.sendMessage")}
                color="primary"
                size="medium"
                sx={{ alignSelf: "flex-end", mb: 1.1, px: 1.4 }}
              >
                <span style={{ fontSize: 20 }}>➤</span>
              </IconButton>
            )}
            {isLoading && (
              <IconButton
                onClick={handleStop}
                size="small"
                color="error"
                aria-label={t("ui.chat.stop")}
                title={t("ui.chat.stop")}
              >
                {t("ui.chat.stop")}
              </IconButton>
            )}
          </Box>

          <Box sx={{ mt: 0.2, mb: -1 }}>
            <ChatUsageIndicator
              isHistorySummarizing={isHistorySummarizing}
              TokenUsageInfo={tokenUsage}
              ContextWindow={contextWindow}
            />
            <List sx={{ my: 0, px: 2.8, color: "text.secondary", backgroundColor: "grey.800", borderRadius: 1.3, fontSize: "0.70em" }}>
              <ListItem sx={{ display: "list-item", listStyle: "disc", padding: 0 }}>{t("ui.chat.aIMayMakeMistakes")}</ListItem>
              <ListItem sx={{ display: "list-item", listStyle: "disc", padding: 0 }}>{t("ui.chat.privacyNotice")}</ListItem>
            </List>
          </Box>
        </Box>
      </StyledChatPopupPaper>
    </>
  );
});
