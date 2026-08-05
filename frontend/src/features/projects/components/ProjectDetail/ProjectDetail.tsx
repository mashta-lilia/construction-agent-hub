import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import type { ProjectDataSlice, ProjectDataUpdater } from "@/providers/ProjectDataProvider";
import { formatCurrency, formatBudget } from "@/lib/format";
import { downloadBlob } from "@/lib/download";
import { Button } from "@/components/Button/Button";
import { Badge } from "@/components/Badge/Badge";
import { InfoCard } from "@/components/InfoCard/InfoCard";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import { RiskBadge } from "@/components/RiskBadge/RiskBadge";
import { SkeletonRows } from "@/components/Skeleton/Skeleton";
import {
  ArrowLeft,
  Briefcase,
  CalendarIcon,
  Clock,
  DollarSign,
  FileText,
  Layers,
  MapPin,
  PenLine,
  TrendingUp,
  User,
  Users,
} from "@/components/Icon/icons";
import type { ProjectDetailTab } from "@/routes/paths";
import { AuditTab, type Project } from "@/features/projects";
import { TabsBar } from "@/features/projects/components/TabsBar/TabsBar";
import { EditProjectModal } from "@/features/projects/components/EditProjectModal/EditProjectModal";
import { DocumentationTab, BlueprintsTab, type ProjectDocument } from "@/features/documents";
import { ReportsTab, type CreateReportPayload, type Report } from "@/features/reports";
import {
  RevisionsTab,
  SubstitutionFlow,
  CompareSubstitutionsDialog,
  getScenario,
  type AuditEntry,
  type RevisionEntry,
} from "@/features/norms";
import { InboxTab, type InboxMessage, type ManualRequestPayload } from "@/features/inbox";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 8, ~lines 3998-4282
 * (`ProjectDetail`). This is the integration point: renders `TabsBar` + the
 * 6 tab bodies, opens `SubstitutionFlow`/`CompareSubstitutionsDialog`/
 * `EditProjectModal`, and owns every project-scoped mutation handler
 * (create report, upload documents, manual substitution request, resolve
 * a substitution).
 *
 * `V. Kuzemko` (the current engineer's short-form byline used on freshly
 * created documents/reports/audit entries) is NOT a new key --
 * `"documents.seed.document.1.author"` already resolves to exactly that
 * bilingual string and is reused here rather than inventing a duplicate.
 * "Just now" reuses `"budget.updatedJustNow"` the same way.
 */
const AUTHOR_KEY = "documents.seed.document.1.author";
const NOW_KEY = "budget.updatedJustNow";
const TODAY = "24.07.2026";

export interface ProjectDetailProps {
  project: Project;
  projects: Project[];
  data: ProjectDataSlice;
  setDocuments: (updater: ProjectDataUpdater<"documents">) => void;
  setReports: (updater: ProjectDataUpdater<"reports">) => void;
  setAudit: (updater: ProjectDataUpdater<"audit">) => void;
  setRevisions: (updater: ProjectDataUpdater<"revisions">) => void;
  setResolution: (updater: ProjectDataUpdater<"resolution">) => void;
  setInboxMessages: (updater: ProjectDataUpdater<"inboxMessages">) => void;
  setSentMessages: (updater: ProjectDataUpdater<"sentMessages">) => void;
  setSpamMessages: (updater: ProjectDataUpdater<"spamMessages">) => void;
  onBack: () => void;
  onUpdateProject: (patch: Partial<Project>) => void;
  initialTab?: ProjectDetailTab;
}

export function ProjectDetail({
  project,
  projects,
  data,
  setDocuments,
  setReports,
  setAudit,
  setRevisions,
  setResolution,
  setInboxMessages,
  setSentMessages,
  setSpamMessages,
  onBack,
  onUpdateProject,
  initialTab,
}: ProjectDetailProps) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>(
    initialTab || (project.hasDemo ? "inbox" : "documentation"),
  );
  /* Brief skeleton placeholder on tab-switch so the swap feels intentional rather than an
     instant/blank flash. Skipped on the very first render (the project-open skeleton in
     `ProjectDetailPage` already covers that transition). */
  const [tabLoading, setTabLoading] = useState(false);
  const firstTabRender = useRef(true);
  useEffect(() => {
    if (firstTabRender.current) {
      firstTabRender.current = false;
      return;
    }
    setTabLoading(true);
    const tm = setTimeout(() => setTabLoading(false), 380);
    return () => clearTimeout(tm);
  }, [activeTab]);

  const [flowOpen, setFlowOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  /* The inbox message (if any) that triggered the currently-open SubstitutionFlow -- lets the
     flow show the actual originating supplier/company instead of always assuming the
     project's primary scenario. Falls back to null (flow then uses its own default). */
  const [activeMessage, setActiveMessage] = useState<InboxMessage | null>(null);
  /* Compare-mode: side-by-side dialog for a project's 2+ simultaneous pending substitution
     requests. */
  const [compareOpen, setCompareOpen] = useState(false);

  const {
    documents,
    blueprints,
    reports,
    audit,
    revisions,
    inboxMessages,
    sentMessages,
    spamMessages,
    resolution,
  } = data;
  const nowLabel = t(NOW_KEY);

  const handleCreateReport = ({ nameKey, format }: CreateReportPayload) => {
    const rid = Date.now();
    const version = `v1.${reports.length}`;
    const ext = format === "PDF" ? "pdf" : "xlsx";
    const resolvedName = t(nameKey);
    const newReport: Report = {
      id: rid,
      nameKey,
      version,
      authorKey: AUTHOR_KEY,
      date: TODAY,
      justNow: true,
      format,
      isNew: true,
    };
    const newDoc: ProjectDocument = {
      id: rid + 1,
      name: `${resolvedName.replace(/\s+/g, "_")}.${ext}`,
      type: format,
      sectionKey: "tab.reports",
      sizeKb: 420,
      authorKey: AUTHOR_KEY,
      date: TODAY,
      isNew: true,
    };
    const auditId = rid + 2;
    setReports((prev) => [...prev, newReport]);
    setDocuments((prev) => [...prev, newDoc]);
    setAudit((prev) => [
      ...prev,
      {
        id: auditId,
        time: nowLabel,
        date: TODAY,
        textKey: t("audit.reportCreated", { name: resolvedName, version }),
        whoKey: AUTHOR_KEY,
        tone: "blue",
      },
    ]);
    toast(t("toast.reportSaved"), "success", () => {
      setReports((prev) => prev.filter((r) => r.id !== newReport.id));
      setDocuments((prev) => prev.filter((d) => d.id !== newDoc.id));
      setAudit((prev) => prev.filter((a) => a.id !== auditId));
    });
  };

  const handleDownload = (title: string, format: string) => {
    const ext = format === "PDF" ? "pdf" : "xlsx";
    const fname = `${title.replace(/\s+/g, "_")}.${ext}`;
    downloadBlob(
      fname,
      `RECONSTRUCTION HUB — ${title}\n\nGenerated for demonstration purposes.`,
      format === "PDF" ? "application/pdf" : "application/vnd.ms-excel",
    );
    toast(t("toast.downloaded", { f: fname }));
  };

  const handleUploadDocuments = (newDocs: ProjectDocument[]) => {
    setDocuments((prev) => [...prev, ...newDocs]);
    const rid = Date.now();
    const names = newDocs.map((d) => d.name).join(", ");
    setAudit((prev) => [
      ...prev,
      {
        id: rid,
        time: nowLabel,
        date: TODAY,
        textKey: t("audit.docsUploaded", { n: newDocs.length, names }),
        whoKey: AUTHOR_KEY,
        tone: "blue",
      },
    ]);
    const newIds = newDocs.map((d) => d.id);
    toast(t("toast.docsUploaded", { n: newDocs.length }), "success", () => {
      setDocuments((prev) => prev.filter((d) => !newIds.includes(d.id)));
      setAudit((prev) => prev.filter((a) => a.id !== rid));
    });
  };

  const handleManualStart = ({ desc }: ManualRequestPayload) => {
    const rid = Date.now();
    const trimmed = (desc || "").trim();
    const excerpt = trimmed ? (trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed) : "—";
    setAudit((prev) => [
      ...prev,
      {
        id: rid,
        time: nowLabel,
        date: TODAY,
        textKey: t("audit.manualLogged", { excerpt }),
        whoKey: AUTHOR_KEY,
        tone: "blue",
      },
    ]);
    /* Simulate the system RECEIVING a new incoming email for this manual request -- sender
       system@rehub.org.ua, unread, with the same hasSubstitution/"Start substitution
       analysis" trigger EmailRow already renders for supplier-originated substitution
       emails. This becomes the new inbox message that SubstitutionFlow opens against. */
    const newMessage: InboxMessage = {
      id: `manual-${rid}`,
      initials: "СИ",
      fromKey: "manual.newRequestFrom",
      companyKey: "manual.newRequestFrom",
      email: "system@rehub.org.ua",
      subjectKey: t("manual.newRequestSubject", { name: t("projects.seed.prj1042.leadEngineer") }),
      previewKey: excerpt,
      receivedKey: NOW_KEY,
      bodyKey: trimmed || "—",
      unread: true,
      hasSubstitution: true,
    };
    setInboxMessages((prev) => [newMessage, ...prev]);
    toast(t("toast.manualLogged"));
    setActiveMessage(newMessage);
    setFlowOpen(true);
  };

  /* Resolved once per project -- drives scenario-accurate report names, audit text and cost
     impact below instead of a single hardcoded scenario applying identically to every
     project. This is the project's PRIMARY scenario, used for header display (the budget
     "recalculated" hint). */
  const scenario = getScenario(project.id);
  /* Compare-mode: the scenario actually being resolved right now may be the project's 2nd
     simultaneous pending request (`activeMessage.scenarioKey`) rather than the primary one --
     everything inside handleResolve/appendSentMessage must key off THIS, not the primary
     `scenario` above, so approving/rejecting one request never mutates the other. */
  const activeScenario = getScenario(project.id, activeMessage?.scenarioKey);
  const matchesActiveRevision = (r: RevisionEntry) =>
    !!r.isSubstitution && (r.scenarioKey ?? null) === (activeMessage?.scenarioKey ?? null);

  /* When a reply is actually dispatched (auto-send enabled), append it into this project's
     Sent folder so it shows up under the "Sent" tab in InboxTab. */
  const appendSentMessage = (replyText: string) => {
    const supplierEmail = activeScenario.email;
    setSentMessages((prev) => [
      {
        id: `sent-${Date.now()}`,
        initials: "ВК",
        fromKey: "projects.seed.prj1042.leadEngineer",
        companyKey: supplierEmail.companyKey,
        email: supplierEmail.email,
        subjectKey: `Re: ${t(supplierEmail.subjectKey)}`,
        previewKey: (replyText || "").slice(0, 120),
        receivedKey: NOW_KEY,
        bodyKey: replyText || "",
        unread: false,
      },
      ...prev,
    ]);
  };

  const handleResolve = (
    kind: "approved" | "rejected",
    withReply: boolean,
    autoSend: boolean,
    replyText: string,
  ) => {
    const rid = Date.now();
    const approved = kind === "approved";
    const supplier = t(activeScenario.supplierNameKey);
    if (withReply && autoSend) appendSentMessage(replyText);

    if (!approved) {
      /* Rejection must NOT create any report or document, must NOT touch the budget, and
         must add exactly one fixed audit-trail line (plus the reply-draft lines below, which
         are still valid since a rejection reply is itself a real contractor communication).
         Compare-mode: only the revision entry matching the request actually being resolved
         flips status -- the OTHER simultaneous pending request (if any) is left untouched. */
      setRevisions((prev) =>
        prev.map((r) => (matchesActiveRevision(r) ? { ...r, statusKey: "rejected" } : r)),
      );
      const extraEntries: AuditEntry[] = [
        ...(withReply
          ? [
              {
                id: rid + 1,
                time: nowLabel,
                date: TODAY,
                textKey: t("audit.replyDraftGenerated", { supplier }),
                whoKey: "audit.systemActor",
                tone: "slate" as const,
              },
            ]
          : []),
        ...(withReply && autoSend
          ? [
              {
                id: rid + 2,
                time: nowLabel,
                date: TODAY,
                textKey: t("audit.replyAutoSent", { supplier }),
                whoKey: "audit.systemActor",
                tone: "blue" as const,
              },
            ]
          : []),
      ];
      setAudit((prev) => [
        ...prev,
        {
          id: rid,
          time: nowLabel,
          date: TODAY,
          textKey: "audit.rejectedNoChange",
          whoKey: AUTHOR_KEY,
          tone: "slate" as const,
        },
        ...extraEntries,
      ]);
      setResolution("rejected");
      setFlowOpen(false);
      toast(
        withReply && autoSend
          ? t("toast.autoSent")
          : withReply
            ? t("toast.replySent")
            : t("toast.rejected"),
        "error",
      );
      setActiveTab("audit");
      return;
    }

    /* Approve path: commit report + document + budget update, all scenario-specific (using
       activeScenario -- the request actually being resolved, see above). */
    const materialShort = t(activeScenario.materialShortNameKey);
    const repNameKey = t("detail.substitutionApprovalReportName", { material: materialShort });
    const fileSlug = activeScenario.key.replace(/[^a-z0-9]+/gi, "_");
    setReports((prev) => [
      ...prev,
      {
        id: rid,
        nameKey: repNameKey,
        version: `v1.${prev.length}`,
        authorKey: AUTHOR_KEY,
        date: TODAY,
        justNow: true,
        format: "PDF",
        isNew: true,
      },
    ]);
    setDocuments((prev) => [
      ...prev,
      {
        id: rid + 1,
        name: `Substitution_Approval_${fileSlug}.pdf`,
        type: "PDF",
        sectionKey: "tab.reports",
        sizeKb: 380,
        authorKey: AUTHOR_KEY,
        date: TODAY,
        isNew: true,
      },
    ]);
    setRevisions((prev) =>
      prev.map((r) => (matchesActiveRevision(r) ? { ...r, statusKey: "approved" } : r)),
    );
    const extraEntries: AuditEntry[] = [
      ...(withReply
        ? [
            {
              id: rid + 3,
              time: nowLabel,
              date: TODAY,
              textKey: t("audit.replyDraftGenerated", { supplier }),
              whoKey: "audit.systemActor",
              tone: "slate" as const,
            },
          ]
        : []),
      ...(withReply && autoSend
        ? [
            {
              id: rid + 4,
              time: nowLabel,
              date: TODAY,
              textKey: t("audit.replyAutoSent", { supplier }),
              whoKey: "audit.systemActor",
              tone: "blue" as const,
            },
          ]
        : []),
    ];
    setAudit((prev) => [
      ...prev,
      {
        id: rid + 2,
        time: nowLabel,
        date: TODAY,
        textKey: activeScenario.auditApprovedTextKey,
        whoKey: AUTHOR_KEY,
        tone: "blue" as const,
      },
      ...extraEntries,
    ]);
    onUpdateProject({
      budget: (project.budget || 0) + activeScenario.costDelta,
      updatedKey: NOW_KEY,
    });
    setResolution("approved");
    setFlowOpen(false);
    toast(
      withReply && autoSend
        ? t("toast.autoSent")
        : withReply
          ? t("toast.replySent")
          : t("toast.approved"),
      "success",
    );
    setActiveTab("reports");
  };

  /* Lightweight one-pager export -- a plain self-contained HTML snapshot of this project's
     header-card data, reusing the exact same `downloadBlob()` mechanism the Reports tab
     already uses. Distinct from ReportsTab's full Create Report flow -- no template/format
     picker, just a snapshot. */
  const handleExportSummary = () => {
    const pname = t(project.nameKey);
    const openSubs = (revisions || []).filter(
      (r) => r.isSubstitution && r.statusKey === "pending",
    ).length;
    const rows: Array<[string, string]> = [
      [t("card.budget"), formatBudget(project.budget, t, locale)],
      [t("edit.stage"), t(`status.${project.statusKey}`)],
      [t("card.deadline"), t(project.deadlineKey)],
      [t("card.client"), t(project.clientKey)],
      [t("card.leadEngineer"), t(project.leadEngineerKey)],
      [t("card.location"), t(project.locationKey)],
      [t("risk.label").replace(/:$/, ""), t(`risk.${project.risk}`)],
      [t("summary.documents"), String((documents || []).length)],
      [t("summary.reports"), String((reports || []).length)],
      [t("summary.openSubstitutions"), String(openSubs)],
    ];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${pname} — ${t("summary.heading")}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;padding:32px;max-width:640px;margin:0 auto;}
h1{font-size:20px;margin:0 0 4px;} .id{color:#64748b;font-size:13px;margin-bottom:20px;font-family:monospace;}
table{width:100%;border-collapse:collapse;} td{padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px;}
td:first-child{color:#64748b;width:45%;} .meta{margin-top:24px;font-size:11px;color:#94a3b8;}</style></head>
<body><h1>${pname}</h1><div class="id">${project.id} · ${t("summary.heading")}</div>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join("")}</table>
<div class="meta">${t("summary.generated")}: ${TODAY}</div></body></html>`;
    downloadBlob(`${pname.replace(/\s+/g, "_")}_summary.html`, html, "text/html");
    toast(t("toast.summaryExported", { p: pname }));
  };

  const resolutionState = (resolution as "approved" | "rejected" | null) ?? null;

  return (
    <div className="rh-project-detail">
      <button type="button" onClick={onBack} className="rh-project-detail-back">
        <ArrowLeft size={14} /> {t("detail.back")}
      </button>
      <div className="rh-project-detail-title-row">
        <div className="rh-project-detail-title-group">
          <h1 className="rh-project-detail-title">{t(project.nameKey)}</h1>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            title={t("edit.title")}
            aria-label={t("edit.title")}
            className="rh-project-detail-edit-btn"
          >
            <PenLine size={16} />
          </button>
        </div>
        <div className="rh-project-detail-title-actions">
          <Button variant="outline" size="sm" onClick={handleExportSummary}>
            <FileText size={14} /> {t("detail.exportSummary")}
          </Button>
          <StatusBadge statusKey={project.statusKey} />
        </div>
      </div>
      <div className="rh-project-detail-id">{project.id}</div>
      <div className="rh-project-detail-risk-row">
        <span className="rh-project-detail-risk-label">{t("risk.label")}</span>
        <RiskBadge risk={project.risk} />
      </div>

      <div className="rh-project-detail-cards">
        <InfoCard
          icon={DollarSign}
          label={t("card.budget")}
          value={formatBudget(project.budget, t, locale)}
          sub={
            resolutionState === "approved" && (
              <div className="rh-project-detail-recalculated rh-animate-fade-in">
                <TrendingUp size={12} /> −{formatCurrency(Math.abs(scenario.costDelta), locale)}{" "}
                {t("card.recalculated")}
              </div>
            )
          }
        />
        <InfoCard icon={Layers} label={t("edit.stage")} value={t(`status.${project.statusKey}`)} />
        <InfoCard
          icon={CalendarIcon}
          label={t("card.deadline")}
          value={t(project.deadlineKey)}
          sub={
            <div className="rh-project-detail-risk-sub">
              <RiskBadge risk={project.risk} />
            </div>
          }
        />
        <InfoCard icon={Clock} label={t("card.lastUpdated")} value={t(project.updatedKey)} />
        <InfoCard icon={Briefcase} label={t("card.client")} value={t(project.clientKey)} />
        <InfoCard icon={User} label={t("card.leadEngineer")} value={t(project.leadEngineerKey)} />
        <InfoCard icon={MapPin} label={t("card.location")} value={t(project.locationKey)} />
      </div>

      {project.teamKeys.length > 0 && (
        <div className="rh-project-detail-team">
          <div className="rh-project-detail-team-label">
            <Users size={14} /> {t("card.team")}
          </div>
          <div className="rh-project-detail-team-badges">
            {project.teamKeys.map((k) => (
              <Badge key={k} variant="outline">
                {t(k)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <TabsBar active={activeTab} onChange={setActiveTab} inboxDot={project.hasAlert} />
      <div key={activeTab + locale} className="rh-animate-fade-in">
        {tabLoading ? (
          <SkeletonRows />
        ) : (
          <>
            {activeTab === "documentation" && (
              <DocumentationTab
                documents={documents}
                onUpload={handleUploadDocuments}
                project={project}
                onUpdateProject={onUpdateProject}
                setReports={setReports}
              />
            )}
            {activeTab === "reports" && (
              <ReportsTab
                project={project}
                reports={reports}
                onCreate={handleCreateReport}
                onDownload={handleDownload}
              />
            )}
            {activeTab === "blueprints" && <BlueprintsTab blueprints={blueprints} />}
            {activeTab === "revisions" && (
              <RevisionsTab
                revisions={revisions}
                onOpenSubstitution={(rev) => {
                  const key = rev.scenarioKey ?? null;
                  const msg =
                    inboxMessages.find(
                      (m) => m.hasSubstitution && (m.scenarioKey ?? null) === key,
                    ) ||
                    inboxMessages.find((m) => m.hasSubstitution) ||
                    null;
                  setActiveMessage(msg);
                  setFlowOpen(true);
                }}
                onCompare={() => setCompareOpen(true)}
              />
            )}
            {activeTab === "audit" && <AuditTab audit={audit} />}
            {activeTab === "inbox" && (
              <InboxTab
                project={project}
                messages={inboxMessages}
                sentMessages={sentMessages}
                spamMessages={spamMessages}
                onStart={(m) => {
                  onUpdateProject({ hasAlert: false });
                  setActiveMessage(m || null);
                  setFlowOpen(true);
                }}
                onManualStart={handleManualStart}
                onMoveToSpam={(m) => {
                  setInboxMessages((prev) => prev.filter((x) => x.id !== m.id));
                  setSpamMessages((prev) => [{ ...m, unread: false }, ...prev]);
                  toast(t("toast.spamMoved"), "success", () => {
                    setSpamMessages((prev) => prev.filter((x) => x.id !== m.id));
                    setInboxMessages((prev) => [m, ...prev]);
                  });
                }}
              />
            )}
          </>
        )}
      </div>

      <SubstitutionFlow
        open={flowOpen}
        project={project}
        message={activeMessage}
        onClose={() => setFlowOpen(false)}
        onResolve={handleResolve}
      />
      <EditProjectModal
        open={editOpen}
        project={project}
        projects={projects}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          onUpdateProject(patch);
          setEditOpen(false);
          toast(t("toast.projectUpdated"));
        }}
      />
      <CompareSubstitutionsDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        project={project}
        messages={inboxMessages.filter((m) => m.hasSubstitution)}
        onOpenWizard={(m) => {
          setCompareOpen(false);
          setActiveMessage(m);
          setFlowOpen(true);
        }}
      />
    </div>
  );
}
