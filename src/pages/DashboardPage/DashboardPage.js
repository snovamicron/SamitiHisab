import React, { useState, useRef, useCallback } from "react";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import Container from "../../components/Layout/Container";
import LoanForm from "../../components/LoanCalculator/LoanForm";
import ResultsSummary from "../../components/LoanCalculator/ResultsSummary";
import ScheduleChart from "../../components/LoanCalculator/ScheduleChart";
import ScheduleTable from "../../components/LoanCalculator/ScheduleTable";
import PdfExportButton from "../../components/LoanCalculator/PdfExportButton";
import { buildLoanSchedule } from "../../utils/loanSchedule";
import "./DashboardPage.css";

/**
 * Dashboard Page Component
 * Main calculator interface with form and results display
 */
function DashboardPage() {
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const chartRef = useRef(null);

  /**
   * Handles form submission and calculates the loan schedule
   */
  const handleCalculate = useCallback((formData) => {
    setIsCalculating(true);

    // Small delay for UX feedback
    setTimeout(() => {
      try {
        const scheduleResult = buildLoanSchedule({
          borrowerName: formData.borrowerName,
          loanAmount: formData.loanAmount,
          startDate: formData.startDate,
          monthlyInterestRate: formData.monthlyInterestRate,
          months: formData.months,
        });

        setResults(scheduleResult);

        // Scroll to results on mobile
        setTimeout(() => {
          const resultsElement = document.getElementById("results-section");
          if (resultsElement && window.innerWidth < 1024) {
            resultsElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } catch (error) {
        console.error("Calculation error:", error);
        alert(
          "An error occurred during calculation. Please check your inputs.",
        );
      } finally {
        setIsCalculating(false);
      }
    }, 300);
  }, []);

  /**
   * Handles form reset
   */
  const handleReset = useCallback(() => {
    setResults(null);
  }, []);

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard__main">
        <Container>
          {/* Page Header */}
          <div className="dashboard__header">
            <h1 className="dashboard__title">SamitiHisab Calculator</h1>
            <p className="dashboard__description">
              Enter the loan details below to generate a complete month-by-month
              repayment schedule with principal, interest, and remaining
              balance.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard__grid">
            {/* Form Section */}
            <div className="dashboard__form-section">
              <LoanForm onCalculate={handleCalculate} onReset={handleReset} />

              {isCalculating && (
                <div className="dashboard__loading">
                  <div className="dashboard__spinner"></div>
                  <span>Calculating schedule...</span>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div
              id="results-section"
              className={`dashboard__results-section ${results ? "dashboard__results-section--visible" : ""}`}
            >
              {results ? (
                <div className="dashboard__results">
                  <ResultsSummary results={results} />

                  <ScheduleChart
                    ref={chartRef}
                    scheduleRows={results.scheduleRows}
                  />

                  <ScheduleTable scheduleRows={results.scheduleRows} />

                  <PdfExportButton results={results} chartRef={chartRef} />
                </div>
              ) : (
                <div className="dashboard__empty-state">
                  <div className="dashboard__empty-icon">📊</div>
                  <h3 className="dashboard__empty-title">No Results Yet</h3>
                  <p className="dashboard__empty-description">
                    Fill in the loan details and click "Calculate Schedule" to
                    see the repayment breakdown.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;
