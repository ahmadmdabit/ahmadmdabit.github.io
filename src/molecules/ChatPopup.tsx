import React, { memo, useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { isLocale } from "@/i18n/locales";
import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ErrorIcon from "@mui/icons-material/Error";
import puter from "@heyputer/puter.js";
import { StatusIndicator } from "@/atoms/StatusIndicator";
import { CloseButton } from "@/atoms/CloseButton";
import MarkdownRenderer from "@/atoms/MarkdownRenderer";
import ChatUsageIndicator from "@/atoms/ChatUsageIndicator";
import { DocumentSources } from "@/constants/chat";
import { CompactionThresholdRatio, CompactionMaxRetries, CompactionRetryBaseDelayMs } from "@/constants/chat";
import { useKeyboardShortcuts, useDocumentIndex, useConversationHistory } from "@/hooks";
import type { Message } from "@/types/Chat.types";

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

const MessageComponent: React.FC<{ message: Message }> = memo(({ message }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ maxWidth: "90%", alignSelf: message.role === "user" ? "flex-end" : "flex-start" }}>
      <Typography
        variant="caption"
        color="grey.400"
      >
        {message.role === "user" ? t("ui.chat.senderYou") : t("ui.chat.senderAssistant")}
      </Typography>
      <Paper
        sx={{
          px: 1.5,
          py: 1,
          mt: 0.5,
          backgroundColor: "grey.700",
          color: message.role === "user" ? "success.main" : "text.primary",
          overflow: "auto",
        }}
      >
        <MarkdownRenderer content={message.text} />
      </Paper>
    </Box>
  );
});

export const ChatPopup: React.FC<{ open: boolean; onClose: () => void }> = memo(({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language.startsWith("tr") ? "tr" : "en";
  const { locale: localeParam } = useParams();
  const locale = isLocale(localeParam) ? localeParam : "en";
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [chatConsent, setChatConsent] = useState(() => sessionStorage.getItem("chatConsent") === "true");
  const [chatConsentError, setChatConsentError] = useState(false);

  // Document indexing hook
  const { searchIndex, loadedDocuments, isIndexing, faqSearchIndexes } = useDocumentIndex({
    documentSources: DocumentSources,
    autoIndex: true,
    locale: "all",
  });

  // Conversation history hook
  const { messages, draft, isLoading, isHistorySummarizing, tokenUsage, contextWindow, send, handleChange, handleKeyDown, handleStop, scrollContainerRef, bottomRef } = useConversationHistory({
    hasConsent: chatConsent,
    locale: currentLocale,
    searchIndex,
    loadedDocuments,
    // NOTE: no `model`/`contextWindow` — the hook tracks the active (possibly
    // fallback-pinned) model internally via its fallback state.
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
  const handleSend = useCallback(() => {
    if (!chatConsent) {
      setChatConsentError(true);
      return;
    }
    setChatConsentError(false);
    send();
  }, [chatConsent, send]);

  // Consent-gated Enter key for the chat input. The hook's handleKeyDown calls
  // send() directly, so without this wrapper Enter would bypass the consent
  // checkbox (defense in depth alongside the disabled-input + handleSend gates).
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    if (!chatConsent && messages.length === 0) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        setChatConsentError(true);
      }
      return;
    }
    handleKeyDown(e);
  }, [chatConsent, messages.length, handleKeyDown]);

  const handleChatConsentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setChatConsent(checked);
    sessionStorage.setItem("chatConsent", String(checked));
    if (checked) {
      setChatConsentError(false);
    }
  }, []);

  // Keyboard shortcuts (Escape to close)
  useKeyboardShortcuts({
    onEscape: onClose,
    onEnter: handleSend,
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
          <MessageComponent
            key={-1}
            message={{
              id: crypto.randomUUID(),
              role: "assistant",
              text: t("ui.chat.initialMessage"),
            }}
          />
          {messages.map((m) => (
            <MessageComponent
              key={m.id}
              message={m}
            />
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

          {!chatConsent && messages.length === 0 && (
            <Box sx={{ mb: 1.5 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={chatConsent}
                      onChange={handleChatConsentChange}
                      size="small"
                      sx={{ py: 0.5, height: "2.5rem" }}
                      slotProps={{
                        input: { "aria-label": t("ui.chat.consentRequired") },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {t("ui.chat.consentRequiredCheckbox")}{" "}
                      <Link
                        to={`/${locale}/privacy`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("ui.misc.footer.privacy")}
                      </Link>
                    </Typography>
                  }
                />
              </FormGroup>
              {chatConsentError && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <ErrorIcon fontSize="inherit" /> {t("ui.chat.consentError")}
                </Typography>
              )}
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
              onKeyDown={handleInputKeyDown}
              disabled={!open || isLoading || isIndexing || (!chatConsent && messages.length === 0)}
              placeholder={
                !chatConsent && messages.length === 0 ? t("ui.chat.consentRequired")
                : isIndexing ?
                  t("ui.chat.pleaseWaitIndexingDocuments")
                : isLoading ?
                  t("ui.chat.loadingPlaceholder")
                : t("ui.chat.placeholder")
              }
            />
            {!isLoading && (
              <IconButton
                onClick={handleSend}
                disabled={!draft.trim() || isLoading || isIndexing || !open || (!chatConsent && messages.length === 0)}
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
