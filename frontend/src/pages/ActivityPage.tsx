import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useUiStore } from "@/store/uiStore";
import { Card } from "@/components/Card/Card";
import { ArrowLeft } from "@/components/Icon/icons";
import { GlobalActivityFeed } from "@/components/layout/GlobalActivityFeed/GlobalActivityFeed";
import { ROUTES } from "@/routes/paths";

/**
 * Route entry point for `ROUTES.activity` ("/activity"), full-page with a
 * back-to-projects breadcrumb button. Direct port of source's inline
 * `view === "activity"` branch (REHUB WORK V8.html ~lines 4632-4642).
 */
export default function ActivityPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const setNavFilter = useUiStore((s) => s.setNavFilter);

  const goToProjectsList = () => {
    setNavFilter(null);
    navigate(ROUTES.projects);
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={goToProjectsList}
        className="btn btn-link p-0 d-inline-flex align-items-center gap-2 text-decoration-none mb-3"
      >
        <ArrowLeft size={16} /> {t("activity.backToProjects")}
      </button>
      <Card>
        <GlobalActivityFeed />
      </Card>
    </div>
  );
}
