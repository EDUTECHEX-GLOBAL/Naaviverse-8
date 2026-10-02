// src/utils/textUtils.js
// Utility functions for string cleaning and diacritic normalization

/**
 * Normalizes text to standard English without diacritics/macrons.
 * e.g., "Hyderābād" -> "Hyderabad"
 */
export function cleanLocationText(str) {
  if (!str || typeof str !== "string") return str || "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ā/g, "a")
    .replace(/Ā/g, "A")
    .replace(/ē/g, "e")
    .replace(/Ē/g, "E")
    .replace(/ī/g, "i")
    .replace(/Ī/g, "I")
    .replace(/ō/g, "o")
    .replace(/Ō/g, "O")
    .replace(/ū/g, "u")
    .replace(/Ū/g, "U");
}

/**
 * Sanitizes location-related properties of a profile object.
 */
export function sanitizeProfileLocations(profile) {
  if (!profile || typeof profile !== "object") return profile;
  const copy = { ...profile };
  if (copy.city) copy.city = cleanLocationText(copy.city);
  if (copy.state) copy.state = cleanLocationText(copy.state);
  if (copy.country) copy.country = cleanLocationText(copy.country);
  if (copy.personalityGeography && typeof copy.personalityGeography === "object") {
    copy.personalityGeography = {
      ...copy.personalityGeography,
      city: cleanLocationText(copy.personalityGeography.city),
      state: cleanLocationText(copy.personalityGeography.state),
      country: cleanLocationText(copy.personalityGeography.country),
    };
  }
  return copy;
}
