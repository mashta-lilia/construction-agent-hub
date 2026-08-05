/**
 * Shared local types for the SubstitutionFlow wizard and its step
 * sub-components. Ported from REHUB WORK V8.html, script block 1,
 * ~lines 3407-3742 (component-local `useState` shapes, never exported by
 * the source since it was a single function -- split out here only because
 * the wizard itself is split across step components).
 */
import type { ScenarioField } from "@/features/norms/types";

/** A scenario field with its current (possibly user-edited) display value.
 * `val` starts as the resolved `value`/`valueKey` text (see
 * `resolveKeyedText` in `./utils`) and is then free-form edited by the
 * engineer in Step 2. */
export interface EditableField extends ScenarioField {
  val: string;
}

/** A pinned/focused source-document sentence reference: which document tab
 * (`doc`, a `ScenarioSource.key`) and which sentence within it (`key`, a
 * `DocSentence.key`). */
export interface SourceRef {
  doc: string;
  key: string;
}

export type ConfirmKind = "approved" | "rejected" | null;
