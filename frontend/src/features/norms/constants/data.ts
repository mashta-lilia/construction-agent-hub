/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 1160-1580.
 *
 * All bilingual `B(en, uk)` literals have been replaced by i18n keys under
 * the `norms.*` namespace (`src/i18n/locales/{en,uk}/norms.json`). This
 * module holds IDs, keys, structure and numbers only -- render with
 * `useI18n().t(key)`. The reply-generation functions at the bottom are the
 * one exception that must call a translator directly (see `Translator` in
 * `types/index.ts` for why).
 */
import { EMAIL, EMAIL_B, EMAIL_B2, EMAIL_C, PROJECT_INBOX_SEEDS } from "@/features/inbox";
import { CURRENT_USER_NAME_KEY } from "@/features/projects";
import type { Project } from "@/features/projects";
import type { DocSentence } from "@/features/documents";
import type {
  AuditEntry,
  Funnel,
  LegacyAiField,
  LegacyComparisonRow,
  ReplyTone,
  RevisionEntry,
  SubstitutionScenario,
  Translator,
} from "@/features/norms/types";

/**
 * Legacy default source sentences for the Section 5 (facade thermal
 * insulation) document -- also referenced by
 * `SUBSTITUTION_SCENARIOS["PRJ-1042"]` below, so defined here once. Lives
 * in `features/norms` (not `features/documents`, despite `DocSentence`
 * being a documents-owned TYPE) specifically to avoid a runtime import
 * cycle: `features/documents/constants/data.ts` already imports `FUNNEL`
 * from this module (for `CATEGORY_OPTIONS`), so this module must not, in
 * turn, import a VALUE from `features/documents` at runtime -- that
 * created a genuine circular import (`documents -> norms -> documents`)
 * that threw `ReferenceError: Cannot access 'DOC_SENTENCES' before
 * initialization` at page load. `features/documents/constants/data.ts`
 * now re-exports `DOC_SENTENCES` FROM here instead, so the dependency only
 * runs one way (documents -> norms). The `DocSentence` TYPE import above
 * is type-only and erased at compile time, so it does not reintroduce the
 * cycle.
 */
export const DOC_SENTENCES: readonly DocSentence[] = [
  { key: "material", textKey: "documents.docSentence.dbnFacade.material.text" },
  { key: "conductivity", textKey: "documents.docSentence.dbnFacade.conductivity.text" },
  { key: "fire", textKey: "documents.docSentence.dbnFacade.fire.text" },
  { key: "thickness", textKey: "documents.docSentence.dbnFacade.thickness.text" },
  { key: "extra", textKey: "documents.docSentence.dbnFacade.extra.text" },
];

/** The AI category-detection funnel taxonomy (section -> node -> material). */
export const FUNNEL: Funnel = {
  sections: [
    { value: "utep", labelKey: "norms.funnel.sections.utep.label" },
    { value: "found", labelKey: "norms.funnel.sections.found.label" },
    { value: "roof", labelKey: "norms.funnel.sections.roof.label" },
    { value: "heating", labelKey: "norms.funnel.sections.heating.label" },
  ],
  nodes: {
    utep: [
      { value: "facade", labelKey: "norms.funnel.nodes.utep.facade.label" },
      { value: "cokol", labelKey: "norms.funnel.nodes.utep.cokol.label" },
    ],
    found: [{ value: "plyta", labelKey: "norms.funnel.nodes.found.plyta.label" }],
    roof: [{ value: "krov", labelKey: "norms.funnel.nodes.roof.krov.label" }],
    heating: [{ value: "radiators", labelKey: "norms.funnel.nodes.heating.radiators.label" }],
  },
  materials: {
    facade: [
      { value: "minvata", labelKey: "norms.funnel.materials.facade.minvata.label" },
      { value: "basalt", labelKey: "norms.funnel.materials.facade.basalt.label" },
    ],
    cokol: [{ value: "xps", labelKey: "norms.funnel.materials.cokol.xps.label" }],
    plyta: [{ value: "beton", labelKey: "norms.funnel.materials.plyta.beton.label" }],
    krov: [{ value: "pinovata", labelKey: "norms.funnel.materials.krov.pinovata.label" }],
    radiators: [
      { value: "bimetal", labelKey: "norms.funnel.materials.radiators.bimetal.label" },
      { value: "steel_panel", labelKey: "norms.funnel.materials.radiators.steelPanel.label" },
    ],
  },
};

/**
 * Legacy default AI-extracted fields / comparison table feeding Scenario A,
 * kept only as legacy/default data (superseded by
 * `SUBSTITUTION_SCENARIOS["PRJ-1042"]`'s own `fields`/`table1`/`table2`) so
 * anything that may still reference them doesn't break -- see source comment
 * ~line 1288-1293.
 */
export const AI_FIELDS: readonly LegacyAiField[] = [
  {
    key: "material",
    labelKey: "field.material",
    valueKey: "norms.legacy.aiField.material.value",
    source: "material",
  },
  { key: "conductivity", labelKey: "field.conductivity", value: "0.041", source: "conductivity" },
  {
    key: "fire",
    labelKey: "field.fire",
    valueKey: "norms.legacy.aiField.fire.value",
    source: "fire",
  },
  { key: "thickness", labelKey: "field.thickness", value: "150", source: "thickness" },
  { key: "frost", labelKey: "field.frost", value: "", source: null, missing: true },
];

export const COMPARISON: readonly LegacyComparisonRow[] = [
  {
    critKey: "norms.legacy.comparison.material.crit",
    projectKey: "norms.legacy.comparison.material.project",
    proposalKey: "norms.legacy.comparison.material.proposal",
    tone: "neutral",
  },
  {
    critKey: "norms.legacy.comparison.thermalConductivity.crit",
    project: "0.041 W/(m·K)",
    proposal: "0.038 W/(m·K)",
    tone: "good",
  },
  {
    critKey: "norms.legacy.comparison.fireClass.crit",
    projectKey: "norms.legacy.comparison.fireClass.project",
    proposalKey: "norms.legacy.comparison.fireClass.proposal",
    tone: "critical",
  },
  {
    critKey: "norms.legacy.comparison.layerThickness.crit",
    project: "150 mm",
    proposal: "120 mm",
    tone: "neutral",
  },
  {
    critKey: "norms.legacy.comparison.estPrice.crit",
    project: "$480/m²",
    proposal: "$310/m²",
    tone: "good",
  },
];

/**
 * 3 scenarios exist, each a fully self-contained record used by
 * SubstitutionFlow and ProjectDetail.handleResolve:
 *   - PRJ-1042 (Kyiv Bridge): critical fire-safety DBN violation.
 *   - PRJ-1038 (Lviv Water Treatment): amber/degraded (compliant but shorter
 *     service life) -- also has a second, simultaneous request wired for
 *     Compare-mode (see `SUBSTITUTION_SCENARIOS_EXTRA`).
 *   - PRJ-1019 (Dnipro Industrial Park): success/recommended.
 * The `"PRJ-1042"` key is intersected onto the type below so `getScenario`'s
 * hardcoded fallback (`SUBSTITUTION_SCENARIOS["PRJ-1042"]`) type-checks as
 * always-defined under `noUncheckedIndexedAccess`, while any OTHER project id
 * still correctly resolves to `SubstitutionScenario | undefined`.
 */
export const SUBSTITUTION_SCENARIOS: Readonly<Record<string, SubstitutionScenario>> & {
  "PRJ-1042": SubstitutionScenario;
} = {
  /* Scenario A -- Critical DBN violation: Kyiv Bridge, mineral wool -> EPS */
  "PRJ-1042": {
    key: "eps_facade",
    email: EMAIL,
    category: "facade-minvata",
    materialShortNameKey: "norms.scenario.prj1042.materialShortName",
    fromMaterialKey: "norms.scenario.prj1042.fromMaterial",
    toMaterialKey: "norms.scenario.prj1042.toMaterial",
    supplierNameKey: "norms.scenario.prj1042.supplierName",
    costDelta: -18500,
    verdict: {
      tone: "critical",
      titleKey: "norms.scenario.prj1042.verdict.title",
      descKey: "norms.scenario.prj1042.verdict.desc",
    },
    sources: [
      {
        key: "dbn",
        name: "ДБН_В.2.6-31.pdf",
        titleKey: "norms.scenario.prj1042.sources.dbn.title",
        sentences: DOC_SENTENCES,
      },
      {
        key: "specman",
        name: "Специфікація_Виробника_EPS.pdf",
        titleKey: "norms.scenario.prj1042.sources.specman.title",
        sentences: [
          { key: "eps1", textKey: "norms.scenario.prj1042.sources.specman.sentences.eps1.text" },
          { key: "eps2", textKey: "norms.scenario.prj1042.sources.specman.sentences.eps2.text" },
          { key: "eps3", textKey: "norms.scenario.prj1042.sources.specman.sentences.eps3.text" },
          { key: "eps4", textKey: "norms.scenario.prj1042.sources.specman.sentences.eps4.text" },
        ],
      },
      {
        key: "dstu_fire",
        name: "ДСТУ_Б_В.1.1-4.pdf",
        titleKey: "norms.scenario.prj1042.sources.dstuFire.title",
        sentences: [
          { key: "fs1", textKey: "norms.scenario.prj1042.sources.dstuFire.sentences.fs1.text" },
          { key: "fs2", textKey: "norms.scenario.prj1042.sources.dstuFire.sentences.fs2.text" },
        ],
      },
    ],
    fields: [
      {
        key: "material",
        labelKey: "field.material",
        valueKey: "norms.scenario.prj1042.fields.material.value",
        sourceDoc: "dbn",
        sourceKey: "material",
      },
      {
        key: "conductivity",
        labelKey: "field.conductivity",
        value: "0.041",
        sourceDoc: "dbn",
        sourceKey: "conductivity",
      },
      {
        key: "fire",
        labelKey: "field.fire",
        valueKey: "norms.scenario.prj1042.fields.fire.value",
        sourceDoc: "dbn",
        sourceKey: "fire",
      },
      {
        key: "thickness",
        labelKey: "field.thickness",
        value: "150",
        sourceDoc: "dbn",
        sourceKey: "thickness",
      },
      {
        key: "frost",
        labelKey: "field.frost",
        value: "",
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        critKey: "norms.scenario.prj1042.table1.fireClass.crit",
        specKey: "norms.scenario.prj1042.table1.fireClass.spec",
        limitKey: "norms.scenario.prj1042.table1.fireClass.limit",
        proposalKey: "norms.scenario.prj1042.table1.fireClass.proposal",
        status: "violation",
        sourceDoc: "dstu_fire",
        sourceKey: "fs1",
      },
      {
        critKey: "norms.scenario.prj1042.table1.thermalConductivity.crit",
        specKey: "norms.scenario.prj1042.table1.thermalConductivity.spec",
        limitKey: "norms.scenario.prj1042.table1.thermalConductivity.limit",
        proposalKey: "norms.scenario.prj1042.table1.thermalConductivity.proposal",
        status: "compliant",
        sourceDoc: "dbn",
        sourceKey: "conductivity",
      },
      {
        critKey: "norms.scenario.prj1042.table1.insulationLayerThickness.crit",
        specKey: "norms.scenario.prj1042.table1.insulationLayerThickness.spec",
        limitKey: "norms.scenario.prj1042.table1.insulationLayerThickness.limit",
        proposalKey: "norms.scenario.prj1042.table1.insulationLayerThickness.proposal",
        status: "violation",
        sourceDoc: "specman",
        sourceKey: "eps4",
      },
      {
        critKey: "norms.scenario.prj1042.table1.heightRestrictionGroupG3.crit",
        specKey: "norms.scenario.prj1042.table1.heightRestrictionGroupG3.spec",
        limitKey: "norms.scenario.prj1042.table1.heightRestrictionGroupG3.limit",
        proposalKey: "norms.scenario.prj1042.table1.heightRestrictionGroupG3.proposal",
        status: "violation",
        sourceDoc: "dstu_fire",
        sourceKey: "fs2",
      },
    ],
    table2: [
      {
        critKey: "norms.scenario.prj1042.table2.material.crit",
        actualKey: "norms.scenario.prj1042.table2.material.actual",
        proposedKey: "norms.scenario.prj1042.table2.material.proposed",
        impactKey: "norms.scenario.prj1042.table2.material.impact",
      },
      {
        critKey: "norms.scenario.prj1042.table2.fireClass.crit",
        actualKey: "norms.scenario.prj1042.table2.fireClass.actual",
        proposedKey: "norms.scenario.prj1042.table2.fireClass.proposed",
        impactKey: "norms.scenario.prj1042.table2.fireClass.impact",
      },
      {
        critKey: "norms.scenario.prj1042.table2.thermalConductivity.crit",
        actualKey: "norms.scenario.prj1042.table2.thermalConductivity.actual",
        proposedKey: "norms.scenario.prj1042.table2.thermalConductivity.proposed",
        impactKey: "norms.scenario.prj1042.table2.thermalConductivity.impact",
      },
      {
        critKey: "norms.scenario.prj1042.table2.estPrice.crit",
        actual: "$480/m²",
        proposed: "$310/m²",
        impactKey: "norms.scenario.prj1042.table2.estPrice.impact",
      },
    ],
    revisionTitleKey: "norms.scenario.prj1042.revisionTitle",
    revisionDescKey: "norms.scenario.prj1042.revisionDesc",
    auditApprovedTextKey: "norms.scenario.prj1042.auditApprovedText",
  },
  /* Scenario B -- Poorer quality / cost reduction: Lviv Water Treatment, bimetallic -> steel panel radiators */
  "PRJ-1038": {
    key: "radiators_steel",
    email: EMAIL_B,
    category: "radiators-bimetal",
    materialShortNameKey: "norms.scenario.prj1038.materialShortName",
    fromMaterialKey: "norms.scenario.prj1038.fromMaterial",
    toMaterialKey: "norms.scenario.prj1038.toMaterial",
    supplierNameKey: "norms.scenario.prj1038.supplierName",
    costDelta: -6200,
    verdict: {
      tone: "amber",
      titleKey: "norms.scenario.prj1038.verdict.title",
      descKey: "norms.scenario.prj1038.verdict.desc",
    },
    sources: [
      {
        key: "spec",
        name: "Специфікація_Опалення.pdf",
        titleKey: "norms.scenario.prj1038.sources.spec.title",
        sentences: [
          {
            key: "material",
            textKey: "norms.scenario.prj1038.sources.spec.sentences.material.text",
          },
          { key: "heat", textKey: "norms.scenario.prj1038.sources.spec.sentences.heat.text" },
          {
            key: "pressure",
            textKey: "norms.scenario.prj1038.sources.spec.sentences.pressure.text",
          },
          {
            key: "warranty",
            textKey: "norms.scenario.prj1038.sources.spec.sentences.warranty.text",
          },
        ],
      },
      {
        key: "dstu_rad",
        name: "ДСТУ_Радіатори.pdf",
        titleKey: "norms.scenario.prj1038.sources.dstuRad.title",
        sentences: [
          {
            key: "dstu_heat",
            textKey: "norms.scenario.prj1038.sources.dstuRad.sentences.dstuHeat.text",
          },
          {
            key: "dstu_pressure",
            textKey: "norms.scenario.prj1038.sources.dstuRad.sentences.dstuPressure.text",
          },
        ],
      },
      {
        key: "supplier_sheet",
        name: "Технічний_лист_Постачальника.pdf",
        titleKey: "norms.scenario.prj1038.sources.supplierSheet.title",
        sentences: [
          {
            key: "s_heat",
            textKey: "norms.scenario.prj1038.sources.supplierSheet.sentences.sHeat.text",
          },
          {
            key: "s_pressure",
            textKey: "norms.scenario.prj1038.sources.supplierSheet.sentences.sPressure.text",
          },
          {
            key: "s_warranty",
            textKey: "norms.scenario.prj1038.sources.supplierSheet.sentences.sWarranty.text",
          },
          {
            key: "s_price",
            textKey: "norms.scenario.prj1038.sources.supplierSheet.sentences.sPrice.text",
          },
        ],
      },
    ],
    fields: [
      {
        key: "material",
        labelKey: "field.material",
        valueKey: "norms.scenario.prj1038.fields.material.value",
        sourceDoc: "spec",
        sourceKey: "material",
      },
      {
        key: "heat",
        labelKey: "field.heatOutput",
        value: "1200",
        sourceDoc: "spec",
        sourceKey: "heat",
      },
      {
        key: "pressure",
        labelKey: "field.pressure",
        value: "8.7",
        sourceDoc: "spec",
        sourceKey: "pressure",
      },
      {
        key: "warranty",
        labelKey: "field.warranty",
        value: "30",
        sourceDoc: "spec",
        sourceKey: "warranty",
      },
      {
        key: "corrosion",
        labelKey: "field.corrosionCert",
        value: "",
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        critKey: "norms.scenario.prj1038.table1.heatOutputPerSection.crit",
        specKey: "norms.scenario.prj1038.table1.heatOutputPerSection.spec",
        limitKey: "norms.scenario.prj1038.table1.heatOutputPerSection.limit",
        proposalKey: "norms.scenario.prj1038.table1.heatOutputPerSection.proposal",
        status: "compliant",
        sourceDoc: "dstu_rad",
        sourceKey: "dstu_heat",
      },
      {
        critKey: "norms.scenario.prj1038.table1.maxWorkingPressure.crit",
        specKey: "norms.scenario.prj1038.table1.maxWorkingPressure.spec",
        limitKey: "norms.scenario.prj1038.table1.maxWorkingPressure.limit",
        proposalKey: "norms.scenario.prj1038.table1.maxWorkingPressure.proposal",
        status: "compliant",
        sourceDoc: "dstu_rad",
        sourceKey: "dstu_pressure",
      },
      {
        critKey: "norms.scenario.prj1038.table1.warrantyServiceLife.crit",
        specKey: "norms.scenario.prj1038.table1.warrantyServiceLife.spec",
        limitKey: "norms.scenario.prj1038.table1.warrantyServiceLife.limit",
        proposalKey: "norms.scenario.prj1038.table1.warrantyServiceLife.proposal",
        status: "compliant",
        sourceDoc: "supplier_sheet",
        sourceKey: "s_warranty",
      },
    ],
    table2: [
      {
        critKey: "norms.scenario.prj1038.table2.radiatorType.crit",
        actualKey: "norms.scenario.prj1038.table2.radiatorType.actual",
        proposedKey: "norms.scenario.prj1038.table2.radiatorType.proposed",
        impactKey: "norms.scenario.prj1038.table2.radiatorType.impact",
      },
      {
        critKey: "norms.scenario.prj1038.table2.warrantyServiceLife.crit",
        actualKey: "norms.scenario.prj1038.table2.warrantyServiceLife.actual",
        proposedKey: "norms.scenario.prj1038.table2.warrantyServiceLife.proposed",
        impactKey: "norms.scenario.prj1038.table2.warrantyServiceLife.impact",
      },
      {
        critKey: "norms.scenario.prj1038.table2.heatOutput.crit",
        actualKey: "norms.scenario.prj1038.table2.heatOutput.actual",
        proposedKey: "norms.scenario.prj1038.table2.heatOutput.proposed",
        impactKey: "norms.scenario.prj1038.table2.heatOutput.impact",
      },
      {
        critKey: "norms.scenario.prj1038.table2.estPrice.crit",
        actualKey: "norms.scenario.prj1038.table2.estPrice.actual",
        proposedKey: "norms.scenario.prj1038.table2.estPrice.proposed",
        impactKey: "norms.scenario.prj1038.table2.estPrice.impact",
      },
    ],
    revisionTitleKey: "norms.scenario.prj1038.revisionTitle",
    revisionDescKey: "norms.scenario.prj1038.revisionDesc",
    auditApprovedTextKey: "norms.scenario.prj1038.auditApprovedText",
  },
  /* Scenario C -- Approved substitution: Dnipro Industrial Park, imported mineral wool -> domestic basalt insulation */
  "PRJ-1019": {
    key: "basalt_domestic",
    email: EMAIL_C,
    category: "facade-minvata",
    materialShortNameKey: "norms.scenario.prj1019.materialShortName",
    fromMaterialKey: "norms.scenario.prj1019.fromMaterial",
    toMaterialKey: "norms.scenario.prj1019.toMaterial",
    supplierNameKey: "norms.scenario.prj1019.supplierName",
    costDelta: -264000,
    verdict: {
      tone: "success",
      titleKey: "norms.scenario.prj1019.verdict.title",
      descKey: "norms.scenario.prj1019.verdict.desc",
    },
    sources: [
      {
        key: "spec",
        name: "Специфікація_Фасаду.pdf",
        titleKey: "norms.scenario.prj1019.sources.spec.title",
        sentences: [
          {
            key: "material",
            textKey: "norms.scenario.prj1019.sources.spec.sentences.material.text",
          },
          {
            key: "conductivity",
            textKey: "norms.scenario.prj1019.sources.spec.sentences.conductivity.text",
          },
          { key: "fire", textKey: "norms.scenario.prj1019.sources.spec.sentences.fire.text" },
          { key: "cert", textKey: "norms.scenario.prj1019.sources.spec.sentences.cert.text" },
        ],
      },
      {
        key: "cert_doc",
        name: "Сертифікат_Термобазальт-M.pdf",
        titleKey: "norms.scenario.prj1019.sources.certDoc.title",
        sentences: [
          {
            key: "c_material",
            textKey: "norms.scenario.prj1019.sources.certDoc.sentences.cMaterial.text",
          },
          {
            key: "c_conductivity",
            textKey: "norms.scenario.prj1019.sources.certDoc.sentences.cConductivity.text",
          },
          { key: "c_fire", textKey: "norms.scenario.prj1019.sources.certDoc.sentences.cFire.text" },
          { key: "c_cert", textKey: "norms.scenario.prj1019.sources.certDoc.sentences.cCert.text" },
        ],
      },
      {
        key: "dbn_therm",
        name: "ДБН_В.2.6-31.pdf",
        titleKey: "norms.scenario.prj1019.sources.dbnTherm.title",
        sentences: [
          {
            key: "dbn_limit",
            textKey: "norms.scenario.prj1019.sources.dbnTherm.sentences.dbnLimit.text",
          },
          {
            key: "dbn_density",
            textKey: "norms.scenario.prj1019.sources.dbnTherm.sentences.dbnDensity.text",
          },
        ],
      },
    ],
    fields: [
      {
        key: "material",
        labelKey: "field.material",
        valueKey: "norms.scenario.prj1019.fields.material.value",
        sourceDoc: "spec",
        sourceKey: "material",
      },
      {
        key: "conductivity",
        labelKey: "field.conductivity",
        value: "0.040",
        sourceDoc: "spec",
        sourceKey: "conductivity",
      },
      {
        key: "fire",
        labelKey: "field.fire",
        valueKey: "norms.scenario.prj1019.fields.fire.value",
        sourceDoc: "spec",
        sourceKey: "fire",
      },
      {
        key: "density",
        labelKey: "field.density",
        value: "140",
        sourceDoc: "spec",
        sourceKey: "material",
      },
      {
        key: "cert",
        labelKey: "field.certificate",
        value: "",
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        critKey: "norms.scenario.prj1019.table1.fireClass.crit",
        specKey: "norms.scenario.prj1019.table1.fireClass.spec",
        limitKey: "norms.scenario.prj1019.table1.fireClass.limit",
        proposalKey: "norms.scenario.prj1019.table1.fireClass.proposal",
        status: "compliant",
        sourceDoc: "cert_doc",
        sourceKey: "c_fire",
      },
      {
        critKey: "norms.scenario.prj1019.table1.thermalConductivity.crit",
        specKey: "norms.scenario.prj1019.table1.thermalConductivity.spec",
        limitKey: "norms.scenario.prj1019.table1.thermalConductivity.limit",
        proposalKey: "norms.scenario.prj1019.table1.thermalConductivity.proposal",
        status: "compliant",
        sourceDoc: "dbn_therm",
        sourceKey: "dbn_limit",
      },
      {
        critKey: "norms.scenario.prj1019.table1.density.crit",
        specKey: "norms.scenario.prj1019.table1.density.spec",
        limitKey: "norms.scenario.prj1019.table1.density.limit",
        proposalKey: "norms.scenario.prj1019.table1.density.proposal",
        status: "compliant",
        sourceDoc: "dbn_therm",
        sourceKey: "dbn_density",
      },
      {
        critKey: "norms.scenario.prj1019.table1.certificateOfConformity.crit",
        specKey: "norms.scenario.prj1019.table1.certificateOfConformity.spec",
        limitKey: "norms.scenario.prj1019.table1.certificateOfConformity.limit",
        proposalKey: "norms.scenario.prj1019.table1.certificateOfConformity.proposal",
        status: "compliant",
        sourceDoc: "cert_doc",
        sourceKey: "c_cert",
      },
    ],
    table2: [
      {
        critKey: "norms.scenario.prj1019.table2.material.crit",
        actualKey: "norms.scenario.prj1019.table2.material.actual",
        proposedKey: "norms.scenario.prj1019.table2.material.proposed",
        impactKey: "norms.scenario.prj1019.table2.material.impact",
      },
      {
        critKey: "norms.scenario.prj1019.table2.thermalConductivity.crit",
        actualKey: "norms.scenario.prj1019.table2.thermalConductivity.actual",
        proposedKey: "norms.scenario.prj1019.table2.thermalConductivity.proposed",
        impactKey: "norms.scenario.prj1019.table2.thermalConductivity.impact",
      },
      {
        critKey: "norms.scenario.prj1019.table2.estPrice.crit",
        actual: "$420/m²",
        proposed: "$386/m²",
        impactKey: "norms.scenario.prj1019.table2.estPrice.impact",
      },
      {
        critKey: "norms.scenario.prj1019.table2.fireClass.crit",
        actualKey: "norms.scenario.prj1019.table2.fireClass.actual",
        proposedKey: "norms.scenario.prj1019.table2.fireClass.proposed",
        impactKey: "norms.scenario.prj1019.table2.fireClass.impact",
      },
    ],
    revisionTitleKey: "norms.scenario.prj1019.revisionTitle",
    revisionDescKey: "norms.scenario.prj1019.revisionDesc",
    auditApprovedTextKey: "norms.scenario.prj1019.auditApprovedText",
  },
};

/**
 * Compare-mode: extra simultaneous scenarios, keyed by an arbitrary
 * scenarioKey string (NOT by project id, since these coexist alongside a
 * project's primary `SUBSTITUTION_SCENARIOS` entry). Same shape as an entry
 * above, adapted with different numbers from Scenario B (radiators) --
 * same "Heating Systems" category, different equipment (heating pipework),
 * and a positive/RECOMMENDED verdict so the two simultaneous Lviv requests
 * read as meaningfully different when compared side by side.
 */
export const SUBSTITUTION_SCENARIOS_EXTRA: Readonly<Record<string, SubstitutionScenario>> = {
  "lviv-pipes-ppr": {
    key: "pipes_ppr",
    email: EMAIL_B2,
    category: "radiators-bimetal",
    materialShortNameKey: "norms.scenarioExtra.lviv-pipes-ppr.materialShortName",
    fromMaterialKey: "norms.scenarioExtra.lviv-pipes-ppr.fromMaterial",
    toMaterialKey: "norms.scenarioExtra.lviv-pipes-ppr.toMaterial",
    supplierNameKey: "norms.scenarioExtra.lviv-pipes-ppr.supplierName",
    costDelta: -4100,
    verdict: {
      tone: "success",
      titleKey: "norms.scenarioExtra.lviv-pipes-ppr.verdict.title",
      descKey: "norms.scenarioExtra.lviv-pipes-ppr.verdict.desc",
    },
    sources: [
      {
        key: "spec",
        name: "Специфікація_Опалення.pdf",
        titleKey: "norms.scenarioExtra.lviv-pipes-ppr.sources.spec.title",
        sentences: [
          {
            key: "material",
            textKey: "norms.scenarioExtra.lviv-pipes-ppr.sources.spec.sentences.material.text",
          },
          {
            key: "pressure",
            textKey: "norms.scenarioExtra.lviv-pipes-ppr.sources.spec.sentences.pressure.text",
          },
          {
            key: "temp",
            textKey: "norms.scenarioExtra.lviv-pipes-ppr.sources.spec.sentences.temp.text",
          },
        ],
      },
      {
        key: "supplier_sheet",
        name: "Технічний_лист_ПолімерБуд.pdf",
        titleKey: "norms.scenarioExtra.lviv-pipes-ppr.sources.supplierSheet.title",
        sentences: [
          {
            key: "s_pressure",
            textKey:
              "norms.scenarioExtra.lviv-pipes-ppr.sources.supplierSheet.sentences.sPressure.text",
          },
          {
            key: "s_temp",
            textKey:
              "norms.scenarioExtra.lviv-pipes-ppr.sources.supplierSheet.sentences.sTemp.text",
          },
          {
            key: "s_life",
            textKey:
              "norms.scenarioExtra.lviv-pipes-ppr.sources.supplierSheet.sentences.sLife.text",
          },
          {
            key: "s_price",
            textKey:
              "norms.scenarioExtra.lviv-pipes-ppr.sources.supplierSheet.sentences.sPrice.text",
          },
        ],
      },
    ],
    fields: [
      {
        key: "material",
        labelKey: "field.material",
        valueKey: "norms.scenarioExtra.lviv-pipes-ppr.fields.material.value",
        sourceDoc: "spec",
        sourceKey: "material",
      },
      {
        key: "pressure",
        labelKey: "field.pressure",
        value: "6",
        sourceDoc: "spec",
        sourceKey: "pressure",
      },
      {
        key: "warranty",
        labelKey: "field.warranty",
        value: "25",
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        critKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxWorkingPressure.crit",
        specKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxWorkingPressure.spec",
        limitKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxWorkingPressure.limit",
        proposalKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxWorkingPressure.proposal",
        status: "compliant",
        sourceDoc: "supplier_sheet",
        sourceKey: "s_pressure",
      },
      {
        critKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxOperatingTemperature.crit",
        specKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxOperatingTemperature.spec",
        limitKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxOperatingTemperature.limit",
        proposalKey: "norms.scenarioExtra.lviv-pipes-ppr.table1.maxOperatingTemperature.proposal",
        status: "compliant",
        sourceDoc: "supplier_sheet",
        sourceKey: "s_temp",
      },
    ],
    table2: [
      {
        critKey: "norms.scenarioExtra.lviv-pipes-ppr.table2.pipeworkMaterial.crit",
        actualKey: "norms.scenarioExtra.lviv-pipes-ppr.table2.pipeworkMaterial.actual",
        proposedKey: "norms.scenarioExtra.lviv-pipes-ppr.table2.pipeworkMaterial.proposed",
        impactKey: "norms.scenarioExtra.lviv-pipes-ppr.table2.pipeworkMaterial.impact",
      },
      {
        critKey: "norms.scenarioExtra.lviv-pipes-ppr.table2.estPricePerMeter.crit",
        actual: "$9.80/m",
        proposed: "$6.20/m",
        impactKey: "norms.scenarioExtra.lviv-pipes-ppr.table2.estPricePerMeter.impact",
      },
    ],
    revisionTitleKey: "norms.scenarioExtra.lviv-pipes-ppr.revisionTitle",
    revisionDescKey: "norms.scenarioExtra.lviv-pipes-ppr.revisionDesc",
    auditApprovedTextKey: "norms.scenarioExtra.lviv-pipes-ppr.auditApprovedText",
  },
};

/**
 * `scenarioKey` (optional) selects a `SUBSTITUTION_SCENARIOS_EXTRA` entry
 * instead of the project's primary scenario -- used when resolving a SECOND
 * simultaneous pending request (compare mode). Omitted/unmatched falls back
 * to the project's single primary scenario exactly as before.
 */
export function getScenario(projectId: string, scenarioKey?: string | null): SubstitutionScenario {
  if (scenarioKey) {
    const extra = SUBSTITUTION_SCENARIOS_EXTRA[scenarioKey];
    if (extra) return extra;
  }
  return SUBSTITUTION_SCENARIOS[projectId] ?? SUBSTITUTION_SCENARIOS["PRJ-1042"];
}

/* ===== Audit trail / revisions ============================================ */

export function makeAudit(project?: Pick<Project, "id" | "hasDemo"> | null): AuditEntry[] {
  const supplierKey =
    project && project.hasDemo
      ? getScenario(project.id).supplierNameKey
      : "norms.audit.defaultSupplierName";
  return [
    {
      id: 1,
      time: "09:40",
      date: "24.07.2026",
      textKey: "norms.audit.entryCreated.text",
      whoKey: supplierKey,
      tone: "blue",
    },
    {
      id: 2,
      time: "10:15",
      date: "24.07.2026",
      textKey: "norms.audit.entryReviewed.text",
      whoKey: "norms.audit.petrenko.name",
      tone: "slate",
    },
  ];
}

export function makeRevisions(project: Pick<Project, "id" | "hasDemo">): RevisionEntry[] {
  const base: RevisionEntry[] = [
    {
      id: 1,
      titleKey: "norms.revision.base.facadeUpdate.title",
      descKey: "norms.revision.base.facadeUpdate.desc",
      authorKey: "norms.revision.base.facadeUpdate.author",
      date: "20.06.2026",
      statusKey: "approved",
    },
    {
      id: 2,
      titleKey: "norms.revision.base.foundationRevision.title",
      descKey: "norms.revision.base.foundationRevision.desc",
      authorKey: "norms.revision.base.foundationRevision.author",
      date: "11.05.2026",
      statusKey: "approved",
    },
  ];
  if (!project.hasDemo) return base;

  const scenario = getScenario(project.id);
  const result: RevisionEntry[] = [
    {
      id: 0,
      titleKey: scenario.revisionTitleKey,
      descKey: scenario.revisionDescKey,
      authorSupplierFromKey: scenario.email.fromKey,
      date: "24.07.2026",
      statusKey: "pending",
      isSubstitution: true,
      scenarioKey: null,
    },
    ...base,
  ];

  /* Compare-mode: one extra pending revision entry per extra simultaneous
     substitution request (see PROJECT_INBOX_SEEDS, features/inbox) -- each
     carries its own scenarioKey so RevisionsTab/ProjectDetail can tell them
     apart when resolving or comparing. Mirrors the original's `unshift` loop
     order exactly (each extra ends up ahead of the primary entry). */
  const seed = PROJECT_INBOX_SEEDS[project.id];
  if (seed?.extraSubstitutions) {
    seed.extraSubstitutions.forEach((es, i) => {
      const s2 = getScenario(project.id, es.scenarioKey);
      result.unshift({
        id: -1 - i,
        titleKey: s2.revisionTitleKey,
        descKey: s2.revisionDescKey,
        authorSupplierFromKey: s2.email.fromKey,
        date: "24.07.2026",
        statusKey: "pending",
        isSubstitution: true,
        scenarioKey: es.scenarioKey,
      });
    });
  }
  return result;
}

/* ===== Reply drafting ======================================================
   Item 2: reply drafts are scenario-aware, resolved via getScenario(project.id)
   -- the same mechanism SubstitutionFlow uses for its Step 1/2 content -- so
   each scenario gets an accurate reply referencing its own materials/supplier.
   A scenario whose verdict is positive ("success") drafts an ACCEPTANCE reply;
   a "critical"/"amber" verdict drafts a REJECTION reply, matching the system's
   own recommendation in both cases.

   Unlike the rest of this module, these two functions must call a translator
   (`t`) directly: the reply body itself needs render-time interpolation
   ({{supplier}}, {{from}}, {{to}}, {{pname}}, {{engineerName}}), which cannot
   be precomputed into static data. Callers should pass a LOCALE-FORCED
   translator (e.g. `i18n.getFixedT(locale)`) so a reply can be drafted in a
   specific locale independent of the current UI language -- exactly matching
   the source prototype's explicit `locale` parameter. This mirrors the
   source's own `findTemplateForReport(report, t, L)` pattern of accepting the
   translator as a parameter. */

export function generateReply(
  t: Translator,
  project: Pick<Project, "id" | "nameKey">,
  scenarioKey?: string,
): string {
  const scenario = getScenario(project.id, scenarioKey);
  const supplier = t(scenario.supplierNameKey);
  const from = t(scenario.fromMaterialKey);
  const to = t(scenario.toMaterialKey);
  const pname = t(project.nameKey);
  const engineerName = t(CURRENT_USER_NAME_KEY);
  const positive = scenario.verdict.tone === "success";
  const bodyKey = positive ? "norms.reply.approved.body" : "norms.reply.rejected.body";
  return t(bodyKey, { supplier, from, to, pname, engineerName });
}

/** Simulated AI regeneration of the draft reply in different registers, still scenario-aware. */
export function generateReplyVariant(
  t: Translator,
  project: Pick<Project, "id" | "nameKey">,
  tone: ReplyTone,
  customPrompt?: string,
  scenarioKey?: string,
): string {
  if (tone === "custom") {
    const note = t("norms.reply.customNote", { prompt: customPrompt ?? "" });
    return `${note}\n\n${generateReply(t, project, scenarioKey)}`;
  }

  const scenario = getScenario(project.id, scenarioKey);
  const supplier = t(scenario.supplierNameKey);
  const from = t(scenario.fromMaterialKey);
  const to = t(scenario.toMaterialKey);
  const pname = t(project.nameKey);
  const positive = scenario.verdict.tone === "success";

  if (tone === "polite") {
    const bodyKey = positive
      ? "norms.reply.polite.approved.body"
      : "norms.reply.polite.rejected.body";
    return t(bodyKey, { supplier, from, to, pname, engineerName: t(CURRENT_USER_NAME_KEY) });
  }
  // tone === "formal"
  const bodyKey = positive
    ? "norms.reply.formal.approved.body"
    : "norms.reply.formal.rejected.body";
  return t(bodyKey, {
    supplier,
    from,
    to,
    pname,
    engineerFormalName: t("norms.reply.formalEngineerSignature"),
  });
}
