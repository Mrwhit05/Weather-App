import { useState, useCallback } from "react";
import { fetchCities } from "../api/geodb";

import debounce from "lodash.debounce";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const debouncedFetch = useCallback(
    debounce(async (value, setSuggestions) => {
      if (value.length > 2){
        const data = await fetchCities(value);
        console.log("city autocomplete data", data);
        if (data.data){
          setSuggestions(data.data.slice(0, 3));
        }
      }
      else {
        setSuggestions([]);
      }
    }, 500),
    []
  );

  const handleInputUpdate = async (e) => {
    const value = e.target.value;
    setCity(value);
    debouncedFetch(value, setSuggestions);
  }

  return (
    <div className="flex rounded-xl shadow relative">
      <input
        className="px-4 py-2 w-64 outline-none"
        value={city}
        onChange={handleInputUpdate}
        placeholder="Enter city"
      />
      <button onClick={() => onSearch(city)} className="bg-blue-500 text-white px-4 py-1 rounded-xl shadow hover:bg-blue-600 hover:shadow-md">Search</button>

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
          {suggestions.map((suggestion) => (
            <div onClick={() => {
              setCity(suggestion.city);
              setSuggestions([]);
              onSearch(suggestion.city);
            }}
            className="px-4 py-2 text-white cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
            >
              {suggestion.countryCode === "US"
                ? `${suggestion.city}, ${suggestion.regionCode}, ${suggestion.countryCode}`
                : `${suggestion.city}, ${suggestion.countryCode}`
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;