export const buildGoogleMapsSearchUrl = (address: string): string => {
  // Encodes the address for Google Maps search intent
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};
