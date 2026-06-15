import { API_URL } from "../config/config";
import { offsetDate } from "./dateService";

/**
 * Book an appointment for a doctor
 * @param {number|string} doctorId
 * @param {number|string} userId
 * @param {string} startDate - ISO datetime string (YYYY-MM-DDTHH:mm:ss)
 * @param {string} endDate   - ISO datetime string (YYYY-MM-DDTHH:mm:ss)
 * @param {string} [notes]   - optional consultation reason
 * @param {number|string} [businessSiteId] - optional business site id
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function bookAppointment(doctorId, userId, startDate, endDate, notes, businessSiteId) {
  try {
    const response = await fetch(`${API_URL}/doctor/${doctorId}/set-appointment`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        idUser: userId,
        startDate,
        endDate,
        ...(notes ? { notes } : {}),
        ...(businessSiteId ? { businessSiteId } : {})
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message ?? "Erreur lors de la prise de rendez-vous" };
    }

    return { success: true, data: result.data ?? result };
  } catch {
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Get available appointment slots for a doctor over a date range
 * @param {number|string} doctorId
 * @param {string} startDate - YYYY-MM-DD (defaults to today)
 * @param {string} endDate   - YYYY-MM-DD (defaults to today + 6 days)
 * @param {number|string} [businessSiteId] - optional business site id
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getAvailableSlots(doctorId, startDate, endDate, businessSiteId) {
  const start = startDate ?? offsetDate(0);
  const end = endDate ?? offsetDate(6);

  let url = `${API_URL}/doctor/${doctorId}/get-appointment/start/${start}/end/${end}`;
  if (businessSiteId) {
    url += `?businessSiteId=${businessSiteId}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

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
