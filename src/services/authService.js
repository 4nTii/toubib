import { API_URL } from "../config/config";
import DateUtils from "./dateService";

const USER_STORAGE_KEY = "user_info";

/**
 * Get user info from localStorage or fetch from API
 * @param {boolean} forceRefresh - Force fetch from API even if cached
 * @returns {Promise<{status: boolean, user: {id, email, phone, firstName, lastName, role}} | null>}
 */
export async function getUserInfo(forceRefresh = false) {
  // Try to get from localStorage first (unless force refresh)
  if (!forceRefresh) {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return { status: true, user };
      } catch (e) {
        // Invalid JSON, clear it
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }

  // Get token for API call
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  // Fetch from API
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
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

    // Format birthDay to fr-FR (day month year)
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
      role: data.data.role,
      gender: data.data.gender,
      photo: data.data.photo,
      biography: data.data.biography,
      dateInscription: data.data.dateInscription,
      lastLogin: data.data.lastLogin ? new Date(data.data.lastLogin) : null,
      isActive: data.data.isActive,
    };

    // Store in localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { status: true, user };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

/**
 * Clear user info from localStorage
 * @returns {void}
 */
export function clearUserInfo() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Update user info in localStorage
 * @param {object} user - User object to store
 * @returns {void}
 */
export function updateUserInfo(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
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
