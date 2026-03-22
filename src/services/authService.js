import { API_URL } from "../config/config";
import DateUtils from "./dateService";

/**
 * Decode JWT token payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired or invalid
 */
export function isTokenExpired(token) {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

/**
 * Get user info by fetching from API (always fetches, no caching)
 * @returns {Promise<{status: boolean, user: object} | null>}
 */
export async function getUserInfo() {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Format birthDay to fr-FR (day month year) for display
    const formattedBirthDay = data.data.birthDay
      ? DateUtils.formatDate(data.data.birthDay)
      : null;
    const user = {
      id: data.data.id,
      email: data.data.email,
      phone: data.data.phone,
      firstName: data.data.firstName,
      lastName: data.data.lastName,
      birthDay: formattedBirthDay,
      birthDayRaw: data.data.birthDay || null,
      role: data.data.role,
      gender: data.data.gender,
      address: data.data.address,
      photo: data.data.photo,
      biography: data.data.biography,
      dateInscription: data.data.dateInscription,
      lastLogin: data.data.lastLogin ? new Date(data.data.lastLogin) : null,
      isActive: data.data.isActive,
      isEmailVerified: data.data.isEmailVerified,
      isPhoneVerified: data.data.isPhoneVerified,
    };

    return { status: true, user };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

/**
 * Send forgot password email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function forgotPassword(email) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'envoi");
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if reset token is valid
 * @param {string} token - Reset token
 * @returns {Promise<{valid: boolean, message?: string}>}
 */
export async function checkResetToken(token) {
  try {
    const response = await fetch(`${API_URL}/auth/check-reset-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok) {
      return { valid: true };
    } else {
      return {
        valid: false,
        message: data.message || "Token invalide ou expiré",
      };
    }
  } catch (error) {
    return { valid: false, message: "Erreur lors de la vérification du token" };
  }
}

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function resetPassword(token, password) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Mot de passe réinitialisé avec succès",
      };
    } else {
      return {
        success: false,
        error: data.message || "Erreur lors de la réinitialisation",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la réinitialisation du mot de passe",
    };
  }
}

/**
 * Update user profile
 * @param {object} fields - Fields to update (firstName, lastName, birthDay, gender, address, email)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function updateUserProfile(fields) {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    return { success: false, error: "Session expirée" };
  }

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Profil mis à jour avec succès",
      };
    } else {
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
