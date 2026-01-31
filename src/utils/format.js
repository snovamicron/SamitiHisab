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
 * Formats a raw integer string with Indian commas for input display
 * e.g. "123456" -> "1,23,456"
 * @param {string} val - Raw string of digits
 * @returns {string}
 */
export function formatIndianInput(val) {
  if (!val) return "";
  const numStr = val.toString();
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  if (otherNumbers !== "") {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  return lastThree;
}

/**
 * Converts a non-negative integer to words (Indian numbering system)
 * e.g. 100000 -> "One Lakh"
 * @param {number|string} num
 * @returns {string}
 */
export function numberToWords(num) {
  let n = parseInt(num, 10);
  if (isNaN(n) || n < 0) return "";
  if (n === 0) return "Zero";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertBelow1000(number) {
    let str = "";
    if (number >= 100) {
      str += units[Math.floor(number / 100)] + " Hundred ";
      number %= 100;
    }
    if (number >= 10 && number <= 19) {
      str += teens[number - 10] + " ";
    } else {
      if (number >= 20) {
        str += tens[Math.floor(number / 10)] + " ";
        number %= 10;
      }
      if (number > 0) {
        str += units[number] + " ";
      }
    }
    return str.trim();
  }

  let result = "";

  // Crores (1,00,00,000)
  if (n >= 10000000) {
    result += convertBelow1000(Math.floor(n / 10000000)) + " Crore ";
    n %= 10000000;
  }

  // Lakhs (1,00,000)
  if (n >= 100000) {
    result += convertBelow1000(Math.floor(n / 100000)) + " Lakh ";
    n %= 100000;
  }

  // Thousands (1,000)
  if (n >= 1000) {
    result += convertBelow1000(Math.floor(n / 1000)) + " Thousand ";
    n %= 1000;
  }

  // Remaining (< 1000)
  if (n > 0) {
    result += convertBelow1000(n);
  }

  return result.trim();
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
