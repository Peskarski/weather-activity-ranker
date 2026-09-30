const PLACEHOLDER_CARDS = 4;

export const ForecastSkeleton = () => {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only" role="status">
        Loading forecast…
      </span>
      <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
      {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
        <div key={index} className="h-40 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );
};
