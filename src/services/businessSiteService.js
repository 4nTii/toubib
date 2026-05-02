import { API_URL } from "../config/config";

/**
 * Fetch business site by ID (with doctors and their available slots)
 * @param {number|string} id - Business site ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getBusinessSiteById(id) {
  try {
    const response = await fetch(`${API_URL}/businesssites/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Erreur lors de la récupération du cabinet",
      };
    }

    const result = await response.json();
    if (result.status && result.data) {
      return { success: true, data: result.data };
    }

    return { success: false, error: "Cabinet non trouvé" };
  } catch (error) {
    console.error("API error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}
