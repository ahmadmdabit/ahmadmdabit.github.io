import { useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { UsageInfo } from "@/types/Chat.types";
import { useTranslation } from "react-i18next";

// Usage Indicator Component — Shows context window utilization, token counts, model, compaction status
const ChatUsageIndicator = ({ ContextWindow, TokenUsageInfo, isHistorySummarizing }: { ContextWindow: number; TokenUsageInfo: UsageInfo; isHistorySummarizing: boolean }) => {
  const { t } = useTranslation();

  // Helper: Calculate usage percentage for the indicator
  const getUsagePercent = useCallback((): number => {
    const total = TokenUsageInfo.prompt + TokenUsageInfo.inputCacheRead;
    const window = ContextWindow;
    return Math.min(100, Math.round((total / window) * 100));
  }, [ContextWindow, TokenUsageInfo]);

  const getUsageColor = useCallback((percent: number): "safe" | "warning" | "danger" => {
    if (percent >= 80) return "danger";
    if (percent >= 60) return "warning";
    return "safe";
  }, []);

  const formatTokenCount = useCallback((count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  }, []);

  const percent = getUsagePercent();
  const color = getUsageColor(percent);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        px: 1.5,
        backgroundColor: "background.surface",
      }}
    >
      {/* Token Counts & Model */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 1, flexWrap: "wrap" }}>
        {/* Token counts */}
        {!isHistorySummarizing && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
            >
              {t("ui.chat.usage.prompt") ?? "Prompt"}
            </Typography>
            <Typography
              variant="body2"
              color={
                getUsageColor(getUsagePercent()) === "danger" ? "error.main"
                : getUsageColor(getUsagePercent()) === "warning" ?
                  "warning.main"
                : "success.main"
              }
              sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
            >
              {formatTokenCount(TokenUsageInfo.prompt)}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
            >
              {t("ui.chat.usage.cache") ?? "Cache"}
            </Typography>
            <Typography
              variant="body2"
              color={
                getUsageColor(getUsagePercent()) === "danger" ? "error.main"
                : getUsageColor(getUsagePercent()) === "warning" ?
                  "warning.main"
                : "success.main"
              }
              sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
            >
              {formatTokenCount(TokenUsageInfo.inputCacheRead)}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
            >
              {t("ui.chat.usage.total") ?? "Total"}
            </Typography>
            <Typography
              variant="body2"
              color={
                getUsageColor(getUsagePercent()) === "danger" ? "error.main"
                : getUsageColor(getUsagePercent()) === "warning" ?
                  "warning.main"
                : "success.main"
              }
              sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
            >
              {formatTokenCount(TokenUsageInfo.prompt + TokenUsageInfo.inputCacheRead)} / {formatTokenCount(ContextWindow)}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
            >
              {t("ui.chat.usage.percent") ?? "Usage"}
            </Typography>
            <Typography
              variant="body2"
              color={
                color === "danger" ? "error.main"
                : color === "warning" ?
                  "warning.main"
                : "success.main"
              }
              sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 400 }}
            >
              {getUsagePercent()}%
            </Typography>
          </Box>
        )}

        {/* Model badge + compaction status */}
        {isHistorySummarizing && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* 
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  backgroundColor: "background.card",
                  border: "1px solid",
                  borderColor: "border.default",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "'Cascadia Code', Consolas, monospace", fontVariant: "tabular-nums", fontWeight: 300, fontSize: "0.75rem" }}
                >
                  {LLMModel.split("/").pop() || LLMModel}
                </Typography>
              </Box> 
            */}

            {isHistorySummarizing && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  backgroundColor: "usage.cache",
                  color: "text.primary",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <CircularProgress
                  size={12}
                  thickness={3}
                  color="primary"
                />
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.75rem" }}
                >
                  {t("ui.chat.historySummarizing")}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatUsageIndicator;
