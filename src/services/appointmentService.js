import { API_URL } from "../config/config";
import { offsetDate } from "./dateService";

/**
 * Get available appointment slots for a doctor over a date range
 * @param {number|string} doctorId
 * @param {string} startDate - YYYY-MM-DD (defaults to today)
 * @param {string} endDate   - YYYY-MM-DD (defaults to today + 6 days)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getAvailableSlots(doctorId, startDate, endDate) {
  const start = startDate ?? offsetDate(0);
  const end = endDate ?? offsetDate(6);

  try {
    const response = await fetch(
      `${API_URL}/doctor/${doctorId}/get-appointment/start/${start}/end/${end}`,
      {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Erreur lors de la récupération des créneaux",
      };
    }

    const result = await response.json();
    if (result.status && result.data) {
      return { success: true, data: result.data };
    }

    return { success: false, error: "Aucun créneau disponible" };
  } catch (error) {
    console.error("API error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}
