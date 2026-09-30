import { useId, useState } from "react";
import { Input, Spinner } from "@shared/components";
import { usePlaceSearch } from "../../hooks";
import { type PlaceSuggestion } from "../../types";
import { countryFlag, getSearchStatus, placeDetails, placeLabel } from "../../utils";

type PlaceComboboxProps = {
  onSelect: (place: PlaceSuggestion) => void;
};

export const PlaceCombobox = ({ onSelect }: PlaceComboboxProps) => {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { places, isError, isFetching, isSearchable, isDebouncing } = usePlaceSearch(query);

  const status = getSearchStatus({
    isSearchable,
    isError,
    hasResults: places.length > 0,
    isLoading: isFetching || isDebouncing,
  });

  const isExpanded = isOpen && status !== "idle";
  const hasOptions = isExpanded && status === "results";
  const optionId = (index: number) => `${id}-option-${index}`;

  const selectPlace = (place: PlaceSuggestion) => {
    setInputValue(placeLabel(place));
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(place);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setQuery(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        if (hasOptions) {
          setActiveIndex((index) => (index + 1) % places.length);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (hasOptions) {
          setActiveIndex((index) => (index <= 0 ? places.length - 1 : index - 1));
        }
        break;
      case "Enter":
        if (hasOptions) {
          e.preventDefault();
          selectPlace(places[Math.max(activeIndex, 0)]);
        }
        break;
      case "Escape":
        if (isExpanded) {
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
        } else {
          setInputValue("");
          setQuery("");
        }
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        id={`${id}-input`}
        label="City or town"
        placeholder="e.g. Chamonix, Biarritz, Kraków"
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={isExpanded}
        aria-controls={listboxId}
        aria-activedescendant={hasOptions && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      />

      <div
        className={`absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${isExpanded ? "" : "hidden"}`}
      >
        <ul id={listboxId} role="listbox" aria-label="Places" className="max-h-80 overflow-y-auto">
          {hasOptions &&
            places.map((place, index) => (
              <li
                key={place.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${index === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectPlace(place)}
              >
                <span aria-hidden="true" className="w-6 text-xl">
                  {countryFlag(place.countryCode)}
                </span>
                <span className="flex flex-col">
                  <span className="font-medium text-gray-900">{place.name}</span>
                  <span className="text-sm text-gray-500">{placeDetails(place)}</span>
                </span>
              </li>
            ))}
        </ul>
        {status === "loading" && (
          <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
            <Spinner />
            Searching…
          </div>
        )}
        {status === "empty" && (
          <p className="px-3 py-3 text-sm text-gray-500">No places found for “{query.trim()}”.</p>
        )}
        {status === "error" && (
          <p className="px-3 py-3 text-sm text-red-600">
            Place search is unavailable right now. Try again in a moment.
          </p>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {isExpanded && status === "results" && `${places.length} places found.`}
        {isExpanded && status === "empty" && "No places found."}
        {isExpanded && status === "error" && "Place search is unavailable."}
      </p>
    </div>
  );
};
