import { memo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PublicIcon from "@mui/icons-material/Public";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import type { ContactInfo } from "@/types/Resume.types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface ContactSectionProps {
  contact: ContactInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = memo(({ contact }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [expand, setExpand] = useState(false);
  const [privacyNoticeConfirm, setPrivacyNoticeConfirm] = useState(false);
  const [privacyNoticeConfirmError, setPrivacyNoticeConfirmError] = useState(false);

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
        setExpand(false);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error(error);
      setSubmissionStatus("error");
    } finally {
      setTimeout(() => setSubmissionStatus("idle"), 5000); // Reset status after 5 seconds
    }
  };

  const contactItems = [
    { icon: <EmailIcon />, text: contact.email, href: `mailto:${contact.email}` },
    { icon: <HomeIcon />, text: contact.address, href: "" }, // No href for address
    { icon: <PublicIcon />, text: contact.website, href: contact.website },
    { icon: <GitHubIcon />, text: contact.github, href: contact.github },
    { icon: <LinkedInIcon />, text: contact.linkedin, href: contact.linkedin },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.contactInformation")}
      </Typography>
      <List>
        {contactItems.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ pb: 0 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={
                item.href ? (
                  <Link href={item.href} target="_blank" rel="noopener noreferrer" color="inherit">
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )
              }
            />
          </ListItem>
        ))}
      </List>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Stack spacing={2}>
          <TextField label={t("ui.form.fullName")} variant="outlined" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField label={t("ui.form.emailAddress")} variant="outlined" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label={t("ui.form.message")} variant="outlined" name="message" multiline rows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />

          <Box pt={1}>
            <Accordion sx={{ borderRadius: 2 }} expanded={expand} onChange={() => setExpand((p) => !p)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                <Typography component="span">{t("ui.misc.privacyNoticeConfirmIntroductory")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Outlet />
                <FormGroup sx={{ background: theme.palette.background.paper, padding: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1">{t("ui.misc.privacyNoticeConfirmIntroductorySub")}</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={privacyNoticeConfirm}
                        onChange={(e) => {
                          setPrivacyNoticeConfirm(e.target.checked);
                          setPrivacyNoticeConfirmError(!e.target.checked);
                          setExpand(false);
                        }}
                        slotProps={{
                          input: { "aria-label": t("ui.misc.privacyNoticeConfirm") },
                        }}
                      />
                    }
                    label={t("ui.misc.privacyNoticeConfirm")}
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {privacyNoticeConfirmError && (
                <Typography color="error" sx={{ display: "flex", alignItems: "center" }}>
                  <ErrorIcon sx={{ mr: 1 }} /> {t('ui.misc.privacyNoticeConfirmError')}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Honeypot field for spam prevention */}
          <Box sx={{ display: "none" }}>
            <input type="hidden" name="_gotcha" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={submissionStatus === "sending"}>
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
    </Box>
  );
});
