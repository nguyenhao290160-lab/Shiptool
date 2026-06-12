export const buildPhoneCallUrl = (phone: string): string => {
  // Strip non-numeric characters for tel link
  const cleanPhone = phone.replace(/\D/g, "");
  return `tel:${cleanPhone}`;
};

export const maskPhoneNumber = (phone: string): string => {
  // Simple masking or formatting if needed, for MVP we can just return it or format groups
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length >= 10) {
    return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  return phone;
};
