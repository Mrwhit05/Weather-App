import { useState } from "react";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  return (
    <div>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
      />
      <button onClick={() => onSearch(city)}>Search</button>
    </div>
  );
}

export default SearchBar;