import { API_URL } from "../config/config";

/**
 * Search for doctors, specialties, establishments
 * @param {string} value - Search query
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function searchDoctors(value) {
  if (value.length < 3) {
    return { success: true, data: [] };
  }

  try {
    const response = await fetch(
      `${API_URL}/search?value=${encodeURIComponent(value)}`,
      {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      return { success: false, error: "Erreur lors de la recherche" };
    }

    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error("Search error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Search for geographic locations
 * @param {string} value - Location query
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function searchGeo(value) {
  if (value.length < 3) {
    return { success: true, data: [] };
  }

  try {
    const response = await fetch(
      `${API_URL}/geo?value=${encodeURIComponent(value)}`,
      {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      return { success: false, error: "Erreur lors de la recherche" };
    }

    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error("Geo error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}
