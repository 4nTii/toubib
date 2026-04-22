/**
 * Formats a fee value (stored in cents) to a human-readable currency string.
 * @param {number|null|undefined} fee - The fee in cents
 * @returns {string} Formatted fee string (e.g. "25.00 €") or "Non renseigné"
 */
export const formatFee = (fee) => {
  if (fee === null || fee === undefined || fee === "") return "Non renseigné";
  return `${(fee / 100).toFixed(2)} €`;
};
