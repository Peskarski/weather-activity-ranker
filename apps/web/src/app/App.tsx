import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQueryParam } from "@shared/hooks";
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
          {placeId && <p className="mt-6 text-gray-500">Selected place: {placeId}</p>}
        </div>
      </main>
    </QueryClientProvider>
  );
}

export default App;
