import { API_URL } from "../config/config";
import DateUtils from "./dateService";
import { fetchWithTokenRefresh } from "./tokenService";

/**
 * Get user info by fetching from API (uses HttpOnly cookie for auth)
 * @returns {Promise<{status: boolean, user: object} | null>}
 */
export async function getUserInfo() {
  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const userData = data.data;

    // Format birthDay to fr-FR (day month year) for display
    const formattedBirthDay = userData.birthDay
      ? DateUtils.formatDate(userData.birthDay)
      : null;

    const user = {
      id: userData.id,
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDay: formattedBirthDay,
      birthDayRaw: userData.birthDay || null,
      role: userData.role,
      gender: userData.gender,
      address: userData.address,
      photo: userData.photo,
      biography: userData.biography,
      socialNumber: userData.socialNumber || null,
      mainDoctor: userData.mainDoctor || null,
      userCard: userData.userCard || null,
      dateInscription: userData.dateInscription,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
      isActive: userData.isActive,
      isEmailVerified: userData.isEmailVerified,
      isPhoneVerified: userData.isPhoneVerified,
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
 * Update user profile (uses HttpOnly cookie for auth)
 * @param {object} fields - Fields to update (firstName, lastName, birthDay, gender, address, email)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function updateUserProfile(fields) {
  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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

/**
 * Change user password (uses HttpOnly cookie for auth)
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function changePassword(oldPassword, newPassword) {
  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/users/me/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Mot de passe mis à jour avec succès",
      };
    } else {
      if (response.status === 401) {
        return { success: false, error: "L'ancien mot de passe est incorrect" };
      }
      return {
        success: false,
        error: data.message || "Erreur lors de la modification du mot de passe",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la modification du mot de passe",
    };
  }
}

/**
 * Add or update user card (uses HttpOnly cookie for auth)
 * @param {object} cardData - Card data (card_holder, card_number, expire_date, card_cvv)
 * @returns {Promise<{success: boolean, message?: string, error?: string, data?: object}>}
 */
export async function addOrUpdateCard(cardData) {
  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/users/me/card`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(cardData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Carte bancaire ajoutée avec succès",
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || "Erreur lors de l'ajout de la carte bancaire",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de l'ajout de la carte bancaire",
    };
  }
}
