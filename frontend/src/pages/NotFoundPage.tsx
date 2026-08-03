import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useUiStore } from "@/store/uiStore";
import { Card, CardContent } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { ArrowLeft } from "@/components/Icon/icons";
import { ROUTES } from "@/routes/paths";

/**
 * Catch-all route (`AppRoutes.tsx`'s `path="*"`). Without this, an
 * unmatched path (a stale bookmark, a typo, a deep link to a project that
 * moved) rendered `AppShell` with an empty `<Outlet />` -- chrome with
 * nothing inside, indistinguishable from a failed load. This gives that
 * case an explicit, navigable page instead.
 */
export default function NotFoundPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const setNavFilter = useUiStore((s) => s.setNavFilter);

  const goToProjectsList = () => {
    setNavFilter(null);
    navigate(ROUTES.projects);
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent className="text-center py-5">
          <h1 className="h4 mb-2">{t("notFound.title")}</h1>
          <p className="text-body-secondary mb-4">{t("notFound.description")}</p>
          <Button onClick={goToProjectsList} className="d-inline-flex align-items-center gap-2">
            <ArrowLeft size={16} /> {t("notFound.backToProjects")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
