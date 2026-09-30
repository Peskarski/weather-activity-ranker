import { type DayScore } from "../../types";
import {
  formatDayOfMonth,
  formatLongDay,
  formatWeekday,
  SCORE_LABELS,
  SCORE_LABEL_STYLES,
} from "../../utils";

type DayStripProps = {
  days: DayScore[];
  bestDay: string | null;
  selectedDate: string;
  onSelect: (date: string) => void;
};

const dayDescription = ({ date, label, score }: DayScore, isBest: boolean) => {
  const rating =
    label === "NOT_POSSIBLE" ? SCORE_LABELS[label] : `${SCORE_LABELS[label]}, ${score} out of 100`;
  return `${formatLongDay(date)}: ${rating}${isBest ? ", best day" : ""}`;
};

export const DayStrip = ({ days, bestDay, selectedDate, onSelect }: DayStripProps) => {
  return (
    <div role="group" aria-label="Daily scores" className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
        const isBest = day.date === bestDay;
        return (
          <button
            key={day.date}
            type="button"
            aria-pressed={isSelected}
            aria-label={dayDescription(day, isBest)}
            onClick={() => onSelect(day.date)}
            className={`flex cursor-pointer flex-col items-center rounded-md border py-1.5 text-xs ${SCORE_LABEL_STYLES[day.label]} ${isSelected ? "ring-2 ring-blue-600 ring-offset-1" : ""}`}
          >
            <span className="font-medium">{formatWeekday(day.date)}</span>
            <span className="text-[0.7rem] opacity-80">{formatDayOfMonth(day.date)}</span>
            <span className="mt-1 text-base font-semibold tabular-nums">
              {day.label === "NOT_POSSIBLE" ? "–" : day.score}
            </span>
            {isBest && <span aria-hidden="true">★</span>}
          </button>
        );
      })}
    </div>
  );
};
