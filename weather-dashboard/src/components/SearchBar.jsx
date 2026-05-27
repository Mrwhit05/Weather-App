import { useState } from "react";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  return (
    <div className="flex rounded-xl overflow-hidden shadow">
      <input
        className="px-4 py-2 w-64 outline-none"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
      />
      <button onClick={() => onSearch(city)} className="bg-blue-500 text-white px-4 py-1 rounded-xl shadow hover:bg-blue-600 hover:shadow-md">Search</button>
    </div>
  );
}

export default SearchBar;