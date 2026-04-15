import { API_URL } from "../config/config";

/**
 * Consultation duration options
 */
export const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
];

/**
 * Get doctor info by fetching from API (uses HttpOnly cookie for auth)
 * @returns {Promise<{status: boolean, data: object} | null>}
 */
export async function getDoctorInfo() {
  try {
    const response = await fetch(`${API_URL}/doctor/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch doctor info:", error);
    return null;
  }
}

/**
 * Update doctor profile (uses HttpOnly cookie for auth)
 * @param {object} fields - Fields to update
 * @param {File|null} photoFile - Profile picture file to upload
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function updateDoctorProfile(fields, photoFile = null) {
  try {
    let response;

    if (photoFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("profilePicture", photoFile);

      // Add other fields as JSON
      if (Object.keys(fields).length > 0) {
        formData.append("data", JSON.stringify(fields));
      }

      response = await fetch(`${API_URL}/doctor/me`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
    } else {
      // Use JSON for regular updates
      response = await fetch(`${API_URL}/doctor/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
      });
    }

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Profil mis à jour avec succès",
        data: data.data,
      };
    } else {
      if (response.status === 401) {
        return { success: false, error: "Session expirée" };
      }
      return {
        success: false,
        error: data.message || "Erreur lors de la mise à jour",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    };
  }
}
