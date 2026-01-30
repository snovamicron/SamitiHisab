import { addMonths, formatDateLabel, formatDateISO } from "./date";
import { roundToTwo } from "./format";

/**
 * Builds a complete loan repayment schedule with equal principal EMI
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
  const principal = parseFloat(loanAmount);
  const rate = parseFloat(monthlyInterestRate) / 100;

  // Calculate base EMI principal (equal principal repayment)
  const baseEmiPrincipal = roundToTwo(principal / N);

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
    const openingPrincipal = roundToTwo(remainingPrincipal);

    // Calculate interest on opening principal
    const interest = roundToTwo(openingPrincipal * rate);

    // EMI principal: equal each month, except last month uses remaining principal
    let emiPrincipal;
    if (i === N) {
      // Final month: pay off remaining principal exactly
      emiPrincipal = openingPrincipal;
    } else {
      emiPrincipal = baseEmiPrincipal;
    }

    const closingPrincipal = roundToTwo(openingPrincipal - emiPrincipal);
    const total = roundToTwo(emiPrincipal + interest);

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
  return roundToTwo(scheduleRows.reduce((sum, row) => sum + row.interest, 0));
}

/**
 * Calculates total amount paid over the loan term
 * @param {Array} scheduleRows - The schedule rows array
 * @returns {number} - Total payment amount
 */
export function calculateTotalPayment(scheduleRows) {
  return roundToTwo(scheduleRows.reduce((sum, row) => sum + row.total, 0));
}
