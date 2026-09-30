import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQueryParam } from "@shared/hooks";
import { ActivityForecast } from "../features/activity-forecast/components";
import { PlaceCombobox } from "../features/place-search/components";

const queryClient = new QueryClient();
queryClient.setDefaultOptions({
  queries: {
    retry: 1,
  },
});

function App() {
  const [placeId, setPlaceId] = useQueryParam("place");

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-svh justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-semibold">Weather Activity Ranker</h1>
          <p className="mt-1 mb-6 text-gray-600">
            How good the next 7 days are for skiing, surfing and sightseeing.
          </p>
          <PlaceCombobox onSelect={(place) => setPlaceId(place.id)} />
          <div className="mt-8">
            {placeId && <ActivityForecast key={placeId} placeId={placeId} />}
            {!placeId && (
              <p className="text-gray-500">
                Search for a city or town to see which activities the week is good for.
              </p>
            )}
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}

export default App;
