import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { ContactInfo } from "@/types/Resume.types";
import { ContactList } from "../items/ContactList";
import { ContactForm } from "../items/ContactForm";

interface ContactSectionProps {
  contact: ContactInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = memo(({ contact }) => {
  const { t } = useTranslation();

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
