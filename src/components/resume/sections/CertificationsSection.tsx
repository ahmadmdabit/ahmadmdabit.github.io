import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

export const CertificationsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const certifications = t('resume.certifications', { returnObjects: true });

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.certifications")}
      </Typography>
      {certifications.map((cert, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography variant="h6">
            {cert.name} ({cert.issuer}) - {cert.year}
          </Typography>
          {cert.reference && (
            <Link href={cert.reference} target="_blank" underline="none">
              Reference
            </Link>
          )}
        </Box>
      ))}
    </Box>
  );
});
