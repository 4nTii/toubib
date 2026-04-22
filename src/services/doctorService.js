import { API_URL } from "../config/config";

/**
 * Fetch doctor by ID
 * @param {number|string} id - Doctor ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getDoctorById(id) {
  try {
    const response = await fetch(`${API_URL}/doctor/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Erreur lors de la récupération du médecin",
      };
    }

    const result = await response.json();

    if (result.status && result.data) {
      return { success: true, data: result.data };
    }

    return { success: false, error: "Médecin non trouvé" };
  } catch (error) {
    console.error("API error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}
