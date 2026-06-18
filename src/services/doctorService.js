import { API_URL } from "../config/config";

export function buildDoctorSlug(firstName, lastName) {
  const slugify = (s) => (s || "").toLowerCase().replace(/\s+/g, "-");
  return `${slugify(firstName)}_${slugify(lastName)}`;
}

/**
 * Fetch doctor by ID + slug (firstName_lastName)
 */
export async function getDoctorById(id, slug) {
  try {
    const response = await fetch(`${API_URL}/doctor/${id}/${slug}`, {
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
