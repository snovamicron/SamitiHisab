/**
 * Date utility functions for loan calculations
 */

/**
 * Adds months to a date, handling edge cases for month-end dates
 * @param {Date|string} date - The starting date
 * @param {number} months - Number of months to add
 * @returns {Date} - New date with months added
 */
export function addMonths(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();

  // Set to first of month to avoid overflow issues
  d.setDate(1);
  // Add the months
  d.setMonth(d.getMonth() + months);

  // Get the last day of the resulting month
  const lastDayOfMonth = new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0,
  ).getDate();

  // Set to the original day or last day of month if original day doesn't exist
  d.setDate(Math.min(originalDay, lastDayOfMonth));

  return d;
}

/**
 * Formats a date to a readable string (DD MMM YYYY)
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDateLabel(date) {
  const d = new Date(date);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return d.toLocaleDateString("en-IN", options);
}

/**
 * Formats a date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date - The date to format
 * @returns {string} - ISO date string
 */
export function formatDateISO(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

/**
 * Gets today's date in YYYY-MM-DD format for input default
 * @returns {string} - Today's date in ISO format
 */
export function getTodayISO() {
  return formatDateISO(new Date());
}
