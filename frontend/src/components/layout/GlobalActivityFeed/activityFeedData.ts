import type { ComponentType } from "react";
import type { IconProps } from "@/components/Icon/Icon";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  FileText,
  Mail,
} from "@/components/Icon/icons";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1233-1240,
 * `ACTIVITY_FEED`). This seed array does not exist yet anywhere in this
 * codebase's `features/*` (grepped for `ACTIVITY_FEED`/`activity.feed` --
 * absent), so it's colocated with the one component that renders it
 * rather than invented as a new top-level "activity" feature folder,
 * which is out of scope for this pass. Every `textKey`/`timeKey` below
 * reuses the existing `notif.item*`/`notif.time*` keys already present in
 * `src/i18n/locales/{en,uk}/common.json` -- source's `ACTIVITY_FEED`
 * literally reused the same six `notif.*` entries (just reordered), so no
 * new i18n keys were needed.
 */
export type ActivityTone = "blue" | "green" | "red" | "amber" | "slate";

export interface ActivityFeedItem {
  id: number;
  tone: ActivityTone;
  icon: ComponentType<IconProps>;
  textKey: string;
  timeKey: string;
}

export const ACTIVITY_FEED: ActivityFeedItem[] = [
  { id: 1, textKey: "notif.item1", timeKey: "notif.time1", icon: Sparkles, tone: "blue" },
  { id: 2, textKey: "notif.item2", timeKey: "notif.time2", icon: CheckCircle2, tone: "green" },
  { id: 3, textKey: "notif.item4", timeKey: "notif.time4", icon: AlertTriangle, tone: "red" },
  { id: 4, textKey: "notif.item5", timeKey: "notif.time5", icon: BarChart3, tone: "amber" },
  { id: 5, textKey: "notif.item6", timeKey: "notif.time6", icon: FileText, tone: "slate" },
  { id: 6, textKey: "notif.item3", timeKey: "notif.time3", icon: Mail, tone: "blue" },
];
