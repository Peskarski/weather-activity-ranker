import { ApiError } from "@shared/api";
import { Button } from "@shared/components";

type ForecastErrorProps = {
  error: Error;
  onRetry: () => void;
};

const describe = (error: Error) => {
  if (!(error instanceof ApiError)) {
    return { title: "Something went wrong loading the forecast.", canRetry: true };
  }
  if (error.code === "PLACE_NOT_FOUND" || error.code === "BAD_USER_INPUT") {
    return {
      title: "We couldn't find that place. The link may be wrong — search for a place above.",
      canRetry: false,
    };
  }
  if (error.code === "UPSTREAM_UNAVAILABLE") {
    return { title: "The weather service isn't responding right now.", canRetry: true };
  }
  if (error.code === "NETWORK_ERROR") {
    return { title: "Couldn't reach the server. Check your connection.", canRetry: true };
  }
  return { title: "Something went wrong loading the forecast.", canRetry: true };
};

export const ForecastError = ({ error, onRetry }: ForecastErrorProps) => {
  const { title, canRetry } = describe(error);

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <p className="text-red-800">{title}</p>
      {canRetry && (
        <Button className="w-auto px-4 text-sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
