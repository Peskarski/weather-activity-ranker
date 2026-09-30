import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

export const useQueryParam = (name: string) => {
  const value = useSyncExternalStore(subscribe, () =>
    new URLSearchParams(window.location.search).get(name),
  );

  const setValue = (next: string | null) => {
    const url = new URL(window.location.href);
    if (next === null) {
      url.searchParams.delete(name);
    } else {
      url.searchParams.set(name, next);
    }
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return [value, setValue] as const;
};
