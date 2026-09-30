import { type ScoreLabel } from "../../types";
import { SCORE_LABELS, SCORE_LABEL_STYLES } from "../../utils";

type ScoreBadgeProps = {
  label: ScoreLabel;
};

export const ScoreBadge = ({ label }: ScoreBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium ${SCORE_LABEL_STYLES[label]}`}
    >
      {SCORE_LABELS[label]}
    </span>
  );
};
