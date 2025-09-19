import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import { StatusIndicator } from "@/atoms/StatusIndicator";
import { CloseButton } from "@/atoms/CloseButton";

function generateReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("experience")) return "John has 10+ years building scalable apps and leading teams at Tech Corp & StartupXYZ.";
  if (m.includes("skill")) return "Proficient in JS/TS, Python, Go, React, Node, AWS, Docker, K8s… full-stack.";
  if (m.includes("project")) return "Check his open-source frameworks & DevTools extensions on GitHub (1k+ stars).";
  if (m.includes("contact")) return "Mail: john.doe@example.com | LinkedIn / GitHub: johndoe | Usually replies within 24 h.";
  return "Ask me about John’s experience, skills, projects or contact details!";
}

const StyledChatPopupPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  position: "fixed",
  top: 64,
  right: 16,
  maxWidth: 480,
  height: "65vh",
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
    width: "calc(100vw - 32px)",
    maxWidth: "none",
  },
  [theme.breakpoints.up("sm")]: {
    width: "50vw",
  },
}));

interface Message {
  sender: "You" | "Assistant";
  text: string;
}

export const ChatPopup: React.FC<{ open: boolean; onClose: () => void }> = memo(({ open, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = useCallback(() => {
    // TODO: Integrate backend service with LLM to generate reply
    return;
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { sender: "You", text: draft }]);
    const reply = generateReply(draft);
    setTimeout(() => setMessages((prev) => [...prev, { sender: "Assistant", text: reply }]), 600);
    setDraft("");
  }, [draft, setMessages]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ sender: "Assistant", text: t('ui.chat.initialMessage') }]);
    }
  }, [messages.length, open, t]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <>
      <Backdrop open={open} sx={{ zIndex: 1200 }} onClick={onClose} />
      <StyledChatPopupPaper className={open ? "open" : ""}>
        <Stack direction="row" alignItems="center" sx={{ p: 1.5, backgroundColor: "grey.800" }}>
          <StatusIndicator />
          <Typography variant="subtitle2" sx={{ ml: 1, flexGrow: 1 }}>
            {t('ui.chat.aiAssistant')}
          </Typography>
          <CloseButton onClick={onClose} />
        </Stack>

        <Stack sx={{ flex: 1, overflowY: "auto", p: 2 }} spacing={2}>
          {messages.map((m, i) => (
            <Box key={i} sx={{ alignSelf: m.sender === "You" ? "flex-end" : "flex-start" }}>
              <Typography variant="caption" color="grey.400">
                {m.sender}
              </Typography>
              <Paper
                sx={{
                  px: 1.5,
                  py: 1,
                  mt: 0.5,
                  backgroundColor: m.sender === "You" ? "success.dark" : "grey.700",
                  maxWidth: "90%",
                }}
              >
                {m.text}
              </Paper>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>

        <TextField
          variant="filled"
          hiddenLabel
          fullWidth
          multiline
          maxRows={3}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: { backgroundColor: "grey.800", borderRadius: 0 },
            },
          }}
          placeholder={t('ui.chat.placeholder')}
        />
      </StyledChatPopupPaper>
    </>
  );
});
