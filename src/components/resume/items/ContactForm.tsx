import { memo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { PrivacyAccordion } from "@/components/resume/items/PrivacyAccordion";


export const ContactForm: React.FC = memo(() => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [privacyNoticeConfirm, setPrivacyNoticeConfirm] = useState(false);
  const [privacyNoticeConfirmError, setPrivacyNoticeConfirmError] = useState(false);

  const handlePrivacyConfirmChange = (checked: boolean) => {
    setPrivacyNoticeConfirm(checked);
  };

  const handlePrivacyErrorChange = (hasError: boolean) => {
    setPrivacyNoticeConfirmError(hasError);
  };

  const handlePrivacyExpandChange = () => {
    // No-op, handled internally
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!privacyNoticeConfirm) {
      console.warn("Privacy Notice Confirmation Required.");
      setPrivacyNoticeConfirmError(true);
      return;
    }

    setSubmissionStatus("sending");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://getform.io/f/awnyrqrb", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setSubmissionStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setPrivacyNoticeConfirm(false);
        setPrivacyNoticeConfirmError(false);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error(error);
      setSubmissionStatus("error");
    } finally {
      setTimeout(() => setSubmissionStatus("idle"), 5000);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <TextField 
          label={t("ui.form.fullName")} 
          variant="outlined" 
          name="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <TextField 
          label={t("ui.form.emailAddress")} 
          variant="outlined" 
          name="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <TextField 
          label={t("ui.form.message")} 
          variant="outlined" 
          name="message" 
          multiline 
          rows={3} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          required 
        />

        <Box pt={1}>
          <PrivacyAccordion
            privacyNoticeConfirm={privacyNoticeConfirm}
            onPrivacyConfirmChange={handlePrivacyConfirmChange}
            privacyNoticeConfirmError={privacyNoticeConfirmError}
            onErrorChange={handlePrivacyErrorChange}
            onExpandChange={handlePrivacyExpandChange}
          />
        </Box>

        {/* Honeypot field for spam prevention */}
        <Box sx={{ display: "none" }}>
          <input type="hidden" name="_gotcha" />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={submissionStatus === "sending"}
          >
            {submissionStatus === "sending" ? t("ui.form.sending") : t("ui.form.sendMessage")}
          </Button>
          {submissionStatus === "success" && (
            <Typography color="success.main" sx={{ display: "flex", alignItems: "center" }}>
              <CheckCircleIcon sx={{ mr: 1 }} /> Message sent successfully!
            </Typography>
          )}
          {submissionStatus === "error" && (
            <Typography color="error" sx={{ display: "flex", alignItems: "center" }}>
              <ErrorIcon sx={{ mr: 1 }} /> An error occurred. Please try again.
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
});