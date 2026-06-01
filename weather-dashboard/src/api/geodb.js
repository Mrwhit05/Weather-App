const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";

const geoApiOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": process.env.REACT_APP_GEODB_API_KEY,
    "x-rapidapi-host": process.env.REACT_APP_GEODB_HOST,
  },
};

export const fetchCities = async (input) => {
  const response = await fetch(
    `${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${input}`,
    geoApiOptions
  );
  const data = await response.json();
  return data;
};