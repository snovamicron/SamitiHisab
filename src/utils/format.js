/**
 * Formatting utilities for currency and numbers
 */

/**
 * Formats a number to Indian Rupee format with commas (e.g., 1,00,000.00)
 * @param {number} num - The number to format
 * @param {boolean} showSymbol - Whether to show ₹ symbol (default true)
 * @returns {string} - Formatted currency string
 */
export function formatINR(num, showSymbol = true) {
  if (num === null || num === undefined || isNaN(num)) {
    return showSymbol ? "₹0.00" : "0.00";
  }

  // Round to 2 decimal places
  const fixed = Math.abs(parseFloat(num)).toFixed(2);
  const [intPart, decPart] = fixed.split(".");

  // Indian number system: last 3 digits, then groups of 2
  let result = "";
  const len = intPart.length;

  if (len <= 3) {
    result = intPart;
  } else {
    // Last 3 digits
    const lastThree = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);

    // Add commas every 2 digits in remaining part
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    result = formatted + "," + lastThree;
  }

  const sign = num < 0 ? "-" : "";
  const symbol = showSymbol ? "₹" : "";

  return `${sign}${symbol}${result}.${decPart}`;
}

/**
 * Rounds a number to 2 decimal places
 * @param {number} num - The number to round
 * @returns {number} - Rounded number
 */
export function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Parses a string to a number, removing commas
 * @param {string} str - The string to parse
 * @returns {number} - Parsed number or 0
 */
export function parseNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/,/g, "").replace(/₹/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a percentage value
 * @param {number} num - The number to format
 * @returns {string} - Formatted percentage string
 */
export function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return "0%";
  }
  return `${parseFloat(num).toFixed(2)}%`;
}
