import { Outlet, useNavigation, useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import { isLocale } from "@/i18n/locales";

export default function App() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { locale: localeParam } = useParams();
  const locale = isLocale(localeParam) ? localeParam : "en";

  return (
    <>
      {navigation.state === "loading" && <p>Loading...</p>}
      <Outlet />
      <footer>
        <Typography
          variant="caption"
          color="grey.400"
          align="center"
          sx={{ pt: 1, pb: 2 }}
        >
          {t("ui.meta.allRightsReserved")} {new Date().getFullYear()} ● <Link to={`/${locale}/privacy`}>{t("ui.misc.footer.privacy")}</Link> ● <Link to={`/${locale}/terms`}>{t("ui.misc.footer.terms")}</Link>
        </Typography>
      </footer>
    </>
  );
}
