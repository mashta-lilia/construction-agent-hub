import { Info } from 'lucide-react';

/**
 * Required by the spec's risk table and by CLAUDE.md: an automated verdict is
 * always a recommendation, never a decision. Render this next to every verdict,
 * report and reply draft produced by the pipeline.
 */
export function RecommendationNotice({ text }: { text: string }) {
  return (
    <div className="alert alert-info d-flex gap-2 align-items-start mb-0" role="alert">
      <Info size={16} className="flex-shrink-0 mt-1" />
      <div className="small">{text}</div>
    </div>
  );
}
