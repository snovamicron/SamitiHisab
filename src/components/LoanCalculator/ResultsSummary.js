import React from "react";
import Card from "../UI/Card";
import { formatINR, formatPercent } from "../../utils/format";
import {
  calculateTotalInterest,
  calculateTotalPayment,
} from "../../utils/loanSchedule";
import "./ResultsSummary.css";

/**
 * Results Summary Component
 * Displays key loan information after calculation
 *
 * @param {Object} results - The calculation results
 */
function ResultsSummary({ results }) {
  const {
    borrowerName,
    loanAmount,
    monthlyInterestRate,
    months,
    emiPrincipal,
    scheduleRows,
  } = results;

  const totalInterest = calculateTotalInterest(scheduleRows);
  const totalPayment = calculateTotalPayment(scheduleRows);

  const summaryItems = [
    {
      label: "Borrower",
      value: borrowerName,
      highlight: false,
    },
    {
      label: "Loan Amount",
      value: formatINR(loanAmount),
      highlight: false,
    },
    {
      label: "Interest Rate",
      value: `${formatPercent(monthlyInterestRate)} per month`,
      highlight: false,
    },
    {
      label: "Tenure",
      value: `${months} month${months > 1 ? "s" : ""}`,
      highlight: false,
    },
    {
      label: "Monthly Principal EMI",
      value: formatINR(emiPrincipal),
      highlight: true,
    },
    {
      label: "Total Interest",
      value: formatINR(totalInterest),
      highlight: false,
    },
    {
      label: "Total Payment",
      value: formatINR(totalPayment),
      highlight: true,
    },
  ];

  return (
    <Card variant="elevated" padding="lg" className="results-summary">
      <Card.Header>
        <h3 className="results-summary__title">📊 Loan Summary</h3>
      </Card.Header>

      <Card.Body>
        <div className="results-summary__grid">
          {summaryItems.map((item, index) => (
            <div
              key={index}
              className={`results-summary__item ${item.highlight ? "results-summary__item--highlight" : ""}`}
            >
              <span className="results-summary__label">{item.label}</span>
              <span className="results-summary__value">{item.value}</span>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ResultsSummary;
