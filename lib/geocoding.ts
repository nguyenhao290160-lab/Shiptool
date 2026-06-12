/**
 * Geocoding helper using Google Geocoding API.
 * Converts addresses to coordinates and vice versa.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

/**
 * Geocode an address to get latitude, longitude, formatted address, and place ID.
 * Uses Google Geocoding API.
 *
 * @param address - The address string to geocode
 * @param apiKey - Google Maps API key
 * @returns GeocodeResult with coordinates and metadata
 * @throws Error if geocoding fails or no results found
 */
export const geocodeAddress = async (
  address: string,
  apiKey: string
): Promise<GeocodeResult> => {
  if (!address?.trim()) {
    throw new Error("Address cannot be empty");
  }

  if (!apiKey) {
    throw new Error("Google Maps API key is required");
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    if (data.status === "ZERO_RESULTS") {
      throw new Error(`No results found for address: "${address}"`);
    }

    if (data.status !== "OK") {
      throw new Error(`Geocoding failed: ${data.status}. ${data.error_message || ""}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("No geocoding results returned");
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    const formattedAddress = result.formatted_address;
    const placeId = result.place_id;

    return {
      lat,
      lng,
      formattedAddress,
      placeId,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
    throw new Error("Unknown geocoding error");
  }
};
