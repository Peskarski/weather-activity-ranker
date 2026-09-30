import { useState } from "react";
import { type ActivityRanking } from "../../types";
import {
  ACTIVITY_ICONS,
  ACTIVITY_NAMES,
  formatLongDay,
  formatShortDay,
  SCORE_LABELS,
  unavailableMessage,
  waveDistanceNote,
} from "../../utils";
import { DayStrip } from "../DayStrip";
import { ReasonList } from "../ReasonList";
import { ScoreBadge } from "../ScoreBadge";

type ActivityCardProps = {
  ranking: ActivityRanking;
  rank: number;
};

export const ActivityCard = ({ ranking, rank }: ActivityCardProps) => {
  const { activity, available, bestDay, days, weekLabel, weekScore } = ranking;
  const [selectedDate, setSelectedDate] = useState(bestDay ?? days[0]?.date);
  const selectedDay = days.find(({ date }) => date === selectedDate);
  const headingId = `activity-${activity}`;
  const note = waveDistanceNote(ranking.waveForecastDistanceKm);

  return (
    <li>
      <article
        aria-labelledby={headingId}
        className={`rounded-xl border bg-white p-4 shadow-xs ${available ? "border-gray-200" : "border-dashed border-gray-300"}`}
      >
        <header className="flex items-center gap-3">
          <span className="w-6 text-sm font-semibold text-gray-400 tabular-nums">{rank}.</span>
          <span aria-hidden="true" className="text-2xl">
            {ACTIVITY_ICONS[activity]}
          </span>
          <h3 id={headingId} className="flex-1 text-lg font-semibold text-gray-900">
            {ACTIVITY_NAMES[activity]}
          </h3>
          <ScoreBadge label={weekLabel} />
          {weekScore !== null && (
            <span className="w-16 text-right text-2xl font-semibold tabular-nums">
              {weekScore}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </span>
          )}
        </header>

        {!available && (
          <p className="mt-2 ml-9 text-sm text-gray-600">
            {unavailableMessage(ranking.unavailableReason)}
          </p>
        )}

        {available && (
          <div className="mt-3 flex flex-col gap-3">
            {bestDay && (
              <p className="text-sm text-gray-600">
                Best day: <span className="font-medium">{formatShortDay(bestDay)}</span>
              </p>
            )}
            <DayStrip
              days={days}
              bestDay={bestDay}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
            {selectedDay && (
              <section aria-label={`Details for ${formatLongDay(selectedDay.date)}`}>
                <h4 className="mb-1 text-sm font-medium text-gray-900">
                  {formatShortDay(selectedDay.date)} · {SCORE_LABELS[selectedDay.label]}
                  {selectedDay.label !== "NOT_POSSIBLE" && ` · ${selectedDay.score}/100`}
                </h4>
                <ReasonList reasons={selectedDay.reasons} />
              </section>
            )}
            {note && <p className="text-xs text-gray-500">{note}</p>}
          </div>
        )}
      </article>
    </li>
  );
};
