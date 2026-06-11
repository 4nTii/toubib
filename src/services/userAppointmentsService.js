import { API_URL } from "../config/config";

export async function getUserAppointments() {
  try {
    const response = await fetch(`${API_URL}/users/me/appointments`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: "Erreur lors de la récupération des rendez-vous" };
    }

    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error("Appointments fetch error:", error);
    return { success: false, error: error.message };
  }
}
