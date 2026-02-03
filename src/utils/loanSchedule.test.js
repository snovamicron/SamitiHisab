import {
  buildLoanSchedule,
  calculateTotalInterest,
  calculateTotalPayment,
} from "./loanSchedule";

describe("buildLoanSchedule - ceiling rounding behavior", () => {
  const result = buildLoanSchedule({
    borrowerName: "Test User",
    loanAmount: 100000,
    startDate: "2025-01-01",
    monthlyInterestRate: 1.1,
    months: 12,
  });

  const { scheduleRows, emiPrincipal } = result;

  test("base EMI is ceiling of principal/months", () => {
    // 100000 / 12 = 8333.33... → ceiling = 8334
    expect(emiPrincipal).toBe(8334);
  });

  test("row 0 (initial) has zero EMI, interest, and total", () => {
    expect(scheduleRows[0].emi).toBe(0);
    expect(scheduleRows[0].interest).toBe(0);
    expect(scheduleRows[0].total).toBe(0);
    expect(scheduleRows[0].isInitialRow).toBe(true);
    expect(scheduleRows[0].closingPrincipal).toBe(100000);
  });

  test("all EMI values (months 1-N) are whole rupees (integers)", () => {
    scheduleRows.slice(1).forEach((row) => {
      expect(Number.isInteger(row.emi)).toBe(true);
    });
  });

  test("all interest values are whole rupees (integers)", () => {
    scheduleRows.slice(1).forEach((row) => {
      expect(Number.isInteger(row.interest)).toBe(true);
    });
  });

  test("months 1 to N-1 use base EMI (ceiling value)", () => {
    for (let i = 1; i < scheduleRows.length - 1; i++) {
      expect(scheduleRows[i].emi).toBe(8334);
    }
  });

  test("first month interest is ceiling of principal × rate", () => {
    // 100000 * 0.011 = 1100 (exact), ceiling = 1100
    expect(scheduleRows[1].interest).toBe(1100);
  });

  test("second month interest is ceiling of opening × rate", () => {
    // Opening = 100000 - 8334 = 91666
    // Interest = 91666 * 0.011 = 1008.326 → ceiling = 1009
    expect(scheduleRows[2].openingPrincipal).toBe(91666);
    expect(scheduleRows[2].interest).toBe(1009);
  });

  test("third month values match expected", () => {
    // Opening = 91666 - 8334 = 83332
    // Interest = 83332 * 0.011 = 916.652 → ceiling = 917
    expect(scheduleRows[3].openingPrincipal).toBe(83332);
    expect(scheduleRows[3].interest).toBe(917);
    expect(scheduleRows[3].emi).toBe(8334);
    expect(scheduleRows[3].closingPrincipal).toBe(74998);
  });

  test("last month EMI adjusts to close principal exactly to zero", () => {
    const lastRow = scheduleRows[scheduleRows.length - 1];
    expect(lastRow.closingPrincipal).toBe(0);
  });

  test("last month EMI is less than base EMI (absorbs ceiling excess)", () => {
    const lastRow = scheduleRows[scheduleRows.length - 1];
    // After 11 months of 8334: 11 * 8334 = 91674
    // Remaining = 100000 - 91674 = 8326
    expect(lastRow.emi).toBe(8326);
    expect(lastRow.emi).toBeLessThan(emiPrincipal);
  });

  test("total principal repaid equals original loan amount exactly", () => {
    const totalPrincipal = scheduleRows.reduce((sum, row) => sum + row.emi, 0);
    expect(totalPrincipal).toBe(100000);
  });

  test("each row total equals EMI + interest", () => {
    scheduleRows.slice(1).forEach((row) => {
      expect(row.total).toBe(row.emi + row.interest);
    });
  });

  test("closing principal equals opening minus EMI", () => {
    scheduleRows.slice(1).forEach((row) => {
      expect(row.closingPrincipal).toBe(row.openingPrincipal - row.emi);
    });
  });
});

describe("buildLoanSchedule - floating-point precision fixes", () => {
  test("capital 90000 at 1.1% yields interest exactly 990 (not 991)", () => {
    // This test catches the floating-point bug where:
    // 90000 * 0.011 = 990.0000000001 (due to IEEE 754)
    // Math.ceil(990.0000000001) = 991 (incorrect)
    // With integer math: ceilDiv(90000 * 1100, 100000) = 990 (correct)
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.1,
      months: 12,
    });

    // After row 1: 100000 - 8334 = 91666
    // After row 2: 91666 - 8334 = 83332
    // After row 3: 83332 - 8334 = 74998
    // After row 4: 74998 - 8334 = 66664
    // After row 5: 66664 - 8334 = 58330
    // After row 6: 58330 - 8334 = 49996
    // After row 7: 49996 - 8334 = 41662
    // After row 8: 41662 - 8334 = 33328
    // After row 9: 33328 - 8334 = 24994
    // After row 10: 24994 - 8334 = 16660
    // Row 11 opening: 16660

    // Find a row where capital * 0.011 is exactly an integer
    // 90000 * 0.011 = 990 (exact)
    // We need to construct a test that hits 90000 capital

    // Let's create a direct test with a custom amount
    const result90k = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 90000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.1,
      months: 1,
    });

    // Row 1: capital = 90000, interest should be exactly 990
    expect(result90k.scheduleRows[1].openingPrincipal).toBe(90000);
    expect(result90k.scheduleRows[1].interest).toBe(990);
  });

  test("capital 100000 at 1% yields interest exactly 1000 (not 1001)", () => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1,
      months: 1,
    });

    expect(result.scheduleRows[1].interest).toBe(1000);
  });

  test("capital 50000 at 2% yields interest exactly 1000 (not 1001)", () => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 50000,
      startDate: "2025-01-01",
      monthlyInterestRate: 2,
      months: 1,
    });

    expect(result.scheduleRows[1].interest).toBe(1000);
  });

  test("interest ceiling is applied when result is fractional", () => {
    // 90001 * 0.011 = 990.011 → ceiling = 991
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 90001,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.1,
      months: 1,
    });

    expect(result.scheduleRows[1].interest).toBe(991);
  });

  test("rate with decimals like 1.15% works correctly", () => {
    // 100000 * 0.0115 = 1150 (exact)
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.15,
      months: 1,
    });

    expect(result.scheduleRows[1].interest).toBe(1150);
  });

  test("rate with 3 decimal places like 1.125% works correctly", () => {
    // 100000 * 0.01125 = 1125 (exact)
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.125,
      months: 1,
    });

    expect(result.scheduleRows[1].interest).toBe(1125);
  });
});

describe("buildLoanSchedule - various tenure lengths", () => {
  const tenures = [6, 12, 24, 36, 48, 60];

  test.each(tenures)(
    "tenure %i months - final closing principal is exactly zero",
    (months) => {
      const result = buildLoanSchedule({
        borrowerName: "Test",
        loanAmount: 100000,
        startDate: "2025-01-01",
        monthlyInterestRate: 1,
        months,
      });
      const lastRow = result.scheduleRows[result.scheduleRows.length - 1];
      expect(lastRow.closingPrincipal).toBe(0);
    },
  );

  test.each(tenures)(
    "tenure %i months - total EMI equals original principal",
    (months) => {
      const result = buildLoanSchedule({
        borrowerName: "Test",
        loanAmount: 100000,
        startDate: "2025-01-01",
        monthlyInterestRate: 1,
        months,
      });
      const totalPrincipal = result.scheduleRows.reduce(
        (sum, row) => sum + row.emi,
        0,
      );
      expect(totalPrincipal).toBe(100000);
    },
  );

  test.each(tenures)(
    "tenure %i months - all EMI and interest values are integers",
    (months) => {
      const result = buildLoanSchedule({
        borrowerName: "Test",
        loanAmount: 100000,
        startDate: "2025-01-01",
        monthlyInterestRate: 1.5,
        months,
      });
      result.scheduleRows.slice(1).forEach((row) => {
        expect(Number.isInteger(row.emi)).toBe(true);
        expect(Number.isInteger(row.interest)).toBe(true);
      });
    },
  );

  test.each(tenures)("tenure %i months - last EMI ≤ base EMI", (months) => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1,
      months,
    });
    const lastRow = result.scheduleRows[result.scheduleRows.length - 1];
    expect(lastRow.emi).toBeLessThanOrEqual(result.emiPrincipal);
  });
});

describe("buildLoanSchedule - principal input handling", () => {
  test("decimal principal is rounded to nearest integer", () => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000.49,
      startDate: "2025-01-01",
      monthlyInterestRate: 1,
      months: 10,
    });

    expect(result.loanAmount).toBe(100000);
    expect(result.scheduleRows[0].closingPrincipal).toBe(100000);
  });

  test("decimal principal rounds up when >= 0.5", () => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000.5,
      startDate: "2025-01-01",
      monthlyInterestRate: 1,
      months: 10,
    });

    expect(result.loanAmount).toBe(100001);
  });
});

describe("calculateTotalInterest", () => {
  test("returns sum of all interest values as integer", () => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.1,
      months: 12,
    });
    const totalInterest = calculateTotalInterest(result.scheduleRows);
    expect(Number.isInteger(totalInterest)).toBe(true);
    expect(totalInterest).toBeGreaterThan(0);
  });
});

describe("calculateTotalPayment", () => {
  test("returns sum of all total values", () => {
    const result = buildLoanSchedule({
      borrowerName: "Test",
      loanAmount: 100000,
      startDate: "2025-01-01",
      monthlyInterestRate: 1.1,
      months: 12,
    });
    const totalPayment = calculateTotalPayment(result.scheduleRows);
    const totalInterest = calculateTotalInterest(result.scheduleRows);
    // Total payment = principal + total interest
    expect(totalPayment).toBe(100000 + totalInterest);
  });
});
