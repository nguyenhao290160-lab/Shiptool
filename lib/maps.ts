export const buildGoogleMapsSearchUrl = (address: string): string => {
  // Encodes the address for Google Maps search intent
  const encodedAddress = encodeURIComponent(address || "");
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

export const buildGoogleMapsDirectionsUrl = (lat?: number, lng?: number, address?: string): string => {
  // Prefer coordinates if available for turn-by-turn navigation intent
  if (typeof lat === "number" && typeof lng === "number") {
    // Use Google Maps directions with lat,lng destination
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  // Fallback to address search if coordinates not present
  if (address) {
    return buildGoogleMapsSearchUrl(address);
  }
  // As a safe fallback, open Google Maps root
  return "https://www.google.com/maps";
};

