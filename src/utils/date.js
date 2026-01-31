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
  // Handle invalid dates gracefully
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

/**
 * Gets today's date in YYYY-MM-DD format for input default
 * @returns {string} - Today's date in ISO format
 */
export function getTodayISO() {
  return formatDateISO(new Date());
}

/**
 * Formats ISO date (YYYY-MM-DD) to Display format (DD/MM/YYYY)
 * @param {string} isoDate - YYYY-MM-DD
 * @returns {string} - DD/MM/YYYY
 */
export function formatDisplayDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Parses Display format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 * @param {string} displayDate - DD/MM/YYYY
 * @returns {string|null} - YYYY-MM-DD or null if invalid
 */
export function parseDateFromDisplay(displayDate) {
  // Regex for strict DD/MM/YYYY format
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = displayDate.match(regex);

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic range checks
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Check strict day validity (e.g., Feb 30)
  const testDate = new Date(year, month - 1, day);
  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() !== month - 1 ||
    testDate.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Builds a masked date display from raw digits
 * @param {string} digits - Raw digit string (0-8 chars)
 * @returns {string} - Formatted display like "12/mm/yyyy" or "dd/mm/yyyy"
 */
export function buildDateDisplay(digits) {
  const scaffold = ["d", "d", "/", "m", "m", "/", "y", "y", "y", "y"];
  const digitPositions = [0, 1, 3, 4, 6, 7, 8, 9];

  for (let i = 0; i < digits.length && i < 8; i++) {
    scaffold[digitPositions[i]] = digits[i];
  }

  return scaffold.join("");
}

/**
 * Converts ISO date to raw digits for masked input
 * @param {string} isoDate - YYYY-MM-DD format
 * @returns {string} - Raw digits DDMMYYYY
 */
export function isoToDigits(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  if (!year || !month || !day) return "";
  return day + month + year;
}

/**
 * Converts raw digits to ISO date if valid
 * @param {string} digits - DDMMYYYY format (8 digits)
 * @returns {string|null} - YYYY-MM-DD or null if invalid
 */
export function digitsToISO(digits) {
  if (digits.length !== 8) return null;

  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;

  const testDate = new Date(year, month - 1, day);
  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() !== month - 1 ||
    testDate.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Validates partial date input and returns status
 * @param {string} digits - Raw digits entered so far (0-8)
 * @returns {Object} - { status: 'empty'|'inprogress'|'valid'|'invalid', message: string }
 */
export function validateDateDigits(digits) {
  if (digits.length === 0) {
    return { status: "empty", message: "" };
  }

  // Validate day first digit (must be 0-3)
  if (digits.length >= 1) {
    const dayFirst = parseInt(digits[0], 10);
    if (dayFirst > 3) {
      return { status: "invalid", message: "Invalid day" };
    }
  }

  // Validate complete day (must be 01-31)
  if (digits.length >= 2) {
    const day = parseInt(digits.slice(0, 2), 10);
    if (day === 0 || day > 31) {
      return { status: "invalid", message: "Invalid day" };
    }
  }

  // Validate month first digit (must be 0-1)
  if (digits.length >= 3) {
    const monthFirst = parseInt(digits[2], 10);
    if (monthFirst > 1) {
      return { status: "invalid", message: "Invalid month" };
    }
  }

  // Validate complete month (must be 01-12)
  if (digits.length >= 4) {
    const month = parseInt(digits.slice(2, 4), 10);
    if (month === 0 || month > 12) {
      return { status: "invalid", message: "Invalid month" };
    }
  }

  // Full date validation when 8 digits entered
  if (digits.length === 8) {
    const isoDate = digitsToISO(digits);
    if (isoDate) {
      return { status: "valid", message: "Valid Date" };
    } else {
      return { status: "invalid", message: "Invalid date" };
    }
  }

  return { status: "inprogress", message: "" };
}

/**
 * Gets cursor position for date masked input based on digit count
 * @param {number} digitCount - Number of digits entered (0-8)
 * @returns {number} - Cursor position in the display string
 */
export function getDateCursorPosition(digitCount) {
  // Display: d d / m m / y y y y
  // Index:   0 1 2 3 4 5 6 7 8 9
  if (digitCount <= 1) return digitCount;
  if (digitCount === 2) return 3; // After slash
  if (digitCount === 3) return 4;
  if (digitCount === 4) return 6; // After slash
  return 2 + digitCount; // 5->7, 6->8, 7->9, 8->10
}

/**
 * Maps display cursor position to digit array index
 * @param {number} displayPos - Cursor position in display string (0-10)
 * @returns {number} - Corresponding digit index (0-8)
 */
export function displayPosToDigitIndex(displayPos) {
  // Display: d d / m m / y y y y
  // Pos:     0 1 2 3 4 5 6 7 8 9
  // Digit:   0 1   2 3   4 5 6 7
  if (displayPos <= 1) return displayPos;
  if (displayPos <= 2) return 2; // On first slash
  if (displayPos <= 4) return displayPos - 1; // 3->2, 4->3
  if (displayPos <= 5) return 4; // On second slash
  if (displayPos <= 9) return displayPos - 2; // 6->4, 7->5, 8->6, 9->7
  return 8; // At end (position 10 or beyond)
}

/**
 * Maps digit array index to display cursor position
 * @param {number} digitIndex - Index in digit array (0-8)
 * @returns {number} - Cursor position in display string
 */
export function digitIndexToDisplayPos(digitIndex) {
  if (digitIndex <= 0) return 0;
  if (digitIndex >= 8) return 10;
  const positions = [0, 1, 3, 4, 6, 7, 8, 9];
  return positions[digitIndex];
}
