const STORAGE_KEY = "toubib_pending_appointment";

/**
 * Save a pending appointment to localStorage (used when user is not authenticated).
 * @param {object} appointment
 * @param {number|string} appointment.doctorId
 * @param {string}        appointment.slug       - doctor slug (firstName_lastName)
 * @param {string}        appointment.date       - YYYY-MM-DD
 * @param {object}        appointment.slot       - { start: "HH:mm", end: "HH:mm" }
 * @param {string}        [appointment.reason]   - optional consultation reason
 */
export function savePendingAppointment(appointment) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointment));
}

/**
 * Retrieve the pending appointment from localStorage.
 * @returns {object|null}
 */
export function getPendingAppointment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Remove the pending appointment from localStorage.
 */
export function clearPendingAppointment() {
  localStorage.removeItem(STORAGE_KEY);
}
