import { addMonths, formatDateLabel, formatDateISO } from "./date";

/**
 * Integer ceiling division: computes ceil(a / b) using only integer operations
 * Avoids floating-point precision issues with Math.ceil(a / b)
 *
 * @param {number} a - Numerator (must be non-negative integer)
 * @param {number} b - Denominator (must be positive integer)
 * @returns {number} - Ceiling of a / b
 */
function ceilDiv(a, b) {
  return Math.floor((a + b - 1) / b);
}

/**
 * Calculates interest using integer-safe arithmetic
 * Avoids floating-point precision issues where Math.ceil(990.0000000001) returns 991
 *
 * Formula: interest = ceil(capitalRupees × monthlyRatePercent / 100)
 * Implemented as: ceilDiv(capitalRupees × rateScaled, 100000)
 * where rateScaled = round(monthlyRatePercent × 1000)
 *
 * This preserves up to 3 decimal places in the rate (e.g., 1.125%)
 *
 * @param {number} capitalRupees - Principal amount in whole rupees (integer)
 * @param {number} monthlyRatePercent - Monthly interest rate as percentage (e.g., 1.1 for 1.1%)
 * @returns {number} - Interest amount rounded UP to whole rupees
 */
function calculateInterestCeil(capitalRupees, monthlyRatePercent) {
  // Scale rate by 1000 to convert to integer representation
  // For 1.1%, rateScaled = 1100 (representing 1100 per 100000)
  const rateScaled = Math.round(monthlyRatePercent * 1000);

  // interest = ceil(capital × rate% / 100)
  //          = ceil(capital × rateScaled / 100000)
  // Use integer ceiling division to avoid floating-point errors
  return ceilDiv(capitalRupees * rateScaled, 100000);
}

/**
 * Builds a complete loan repayment schedule with equal principal EMI
 *
 * Uses ceiling rounding (round UP to whole rupee) for:
 * - EMI principal: ceil(loanAmount / months) for months 1 to N-1
 * - Monthly interest: ceil(openingPrincipal × rate / 100)
 *
 * Both calculations use integer-safe arithmetic to avoid floating-point
 * precision errors (e.g., 990.0000000001 incorrectly ceiling to 991).
 *
 * The last month's EMI is adjusted to equal the remaining principal,
 * absorbing any excess from cumulative ceiling rounding, ensuring:
 * - Total principal repaid = original loan amount exactly
 * - Final closing principal = 0
 *
 * @param {Object} params - Loan parameters
 * @param {string} params.borrowerName - Name of the borrower
 * @param {number} params.loanAmount - Principal loan amount in INR
 * @param {string|Date} params.startDate - Loan start date
 * @param {number} params.monthlyInterestRate - Monthly interest rate in percentage
 * @param {number} params.months - Total number of months (N)
 *
 * @returns {Object} - Contains scheduleRows array and emiPrincipal
 */
export function buildLoanSchedule({
  borrowerName,
  loanAmount,
  startDate,
  monthlyInterestRate,
  months,
}) {
  const scheduleRows = [];
  const N = parseInt(months, 10);
  // Ensure principal is a whole rupee (integer) to enable integer arithmetic
  const principal = Math.round(parseFloat(loanAmount));
  const rate = parseFloat(monthlyInterestRate);

  // Calculate base EMI principal using integer ceiling division
  const baseEmiPrincipal = ceilDiv(principal, N);

  // Row 0: Initial state (disbursement row)
  scheduleRows.push({
    id: 0,
    dateISO: formatDateISO(startDate),
    dateLabel: formatDateLabel(startDate),
    openingPrincipal: principal,
    closingPrincipal: principal,
    emi: 0,
    interest: 0,
    total: 0,
    isInitialRow: true,
  });

  let remainingPrincipal = principal;

  // Generate rows 1 to N
  for (let i = 1; i <= N; i++) {
    const rowDate = addMonths(new Date(startDate), i);
    const openingPrincipal = remainingPrincipal;

    // Calculate interest using integer-safe ceiling arithmetic
    const interest = calculateInterestCeil(openingPrincipal, rate);

    // EMI principal: ceiling each month, except last month uses remaining principal
    let emiPrincipal;
    if (i === N) {
      // Final month: pay off remaining principal exactly
      // This absorbs the cumulative excess from ceiling rounding
      emiPrincipal = openingPrincipal;
    } else {
      emiPrincipal = baseEmiPrincipal;
    }

    const closingPrincipal = openingPrincipal - emiPrincipal;
    const total = emiPrincipal + interest;

    scheduleRows.push({
      id: i,
      dateISO: formatDateISO(rowDate),
      dateLabel: formatDateLabel(rowDate),
      openingPrincipal: openingPrincipal,
      closingPrincipal: closingPrincipal,
      emi: emiPrincipal,
      interest: interest,
      total: total,
      isInitialRow: false,
    });

    remainingPrincipal = closingPrincipal;
  }

  return {
    scheduleRows,
    emiPrincipal: baseEmiPrincipal,
    borrowerName,
    loanAmount: principal,
    monthlyInterestRate,
    months: N,
  };
}

/**
 * Calculates total interest paid over the loan term
 * @param {Array} scheduleRows - The schedule rows array
 * @returns {number} - Total interest amount
 */
export function calculateTotalInterest(scheduleRows) {
  return scheduleRows.reduce((sum, row) => sum + row.interest, 0);
}

/**
 * Calculates total amount paid over the loan term
 * @param {Array} scheduleRows - The schedule rows array
 * @returns {number} - Total payment amount
 */
export function calculateTotalPayment(scheduleRows) {
  return scheduleRows.reduce((sum, row) => sum + row.total, 0);
}
