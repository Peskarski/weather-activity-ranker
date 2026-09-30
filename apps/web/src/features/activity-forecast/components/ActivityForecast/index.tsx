import { countryFlag, placeLabel } from "@shared/utils";
import { useActivityForecast } from "../../hooks";
import { ActivityCard } from "../ActivityCard";
import { ForecastError } from "../ForecastError";
import { ForecastSkeleton } from "../ForecastSkeleton";

type ActivityForecastProps = {
  placeId: string;
};

export const ActivityForecast = ({ placeId }: ActivityForecastProps) => {
  const { data: forecast, error, isPending, refetch } = useActivityForecast(placeId);

  if (isPending) {
    return <ForecastSkeleton />;
  }

  if (error) {
    return <ForecastError error={error} onRetry={() => refetch()} />;
  }

  const { place, activities } = forecast;

  return (
    <section aria-labelledby="forecast-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="forecast-heading" className="text-xl font-semibold text-gray-900">
          <span aria-hidden="true">{countryFlag(place.countryCode)} </span>
          {placeLabel(place)}
        </h2>
        <p className="text-sm text-gray-600">Activities ranked for the next 7 days.</p>
      </div>
      <p className="sr-only" role="status">
        Forecast loaded for {place.name}.
      </p>
      <ol className="flex flex-col gap-3">
        {activities.map((ranking, index) => (
          <ActivityCard key={ranking.activity} ranking={ranking} rank={index + 1} />
        ))}
      </ol>
    </section>
  );
};
