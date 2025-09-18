import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ContactList } from "@/components/resume/items/ContactList";
import { ContactForm } from "@/components/resume/items/ContactForm";

export const ContactSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const contact = t('resume.contactInfo', { returnObjects: true });
  
  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.contactInformation")}
      </Typography>
      <ContactList contact={contact} />
      <ContactForm />
    </Box>
  );
});
