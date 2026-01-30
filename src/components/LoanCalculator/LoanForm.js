import React, { useState, useCallback } from "react";
import Card from "../UI/Card";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { getTodayISO } from "../../utils/date";
import "./LoanForm.css";

/**
 * Initial form state
 */
const initialFormState = {
  borrowerName: "",
  loanAmount: "",
  startDate: getTodayISO(),
  monthlyInterestRate: "",
  months: "",
};

/**
 * Initial errors state
 */
const initialErrorsState = {
  borrowerName: "",
  loanAmount: "",
  startDate: "",
  monthlyInterestRate: "",
  months: "",
};

/**
 * Loan Form Component
 * Handles input collection and validation for loan calculations
 *
 * @param {Function} onCalculate - Callback when form is submitted with valid data
 * @param {Function} onReset - Callback when form is reset
 */
function LoanForm({ onCalculate, onReset }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrorsState);
  const [touched, setTouched] = useState({});

  /**
   * Validates a single field
   */
  const validateField = useCallback((name, value) => {
    switch (name) {
      case "borrowerName":
        if (!value.trim()) {
          return "Borrower name is required";
        }
        if (value.trim().length < 2) {
          return "Name must be at least 2 characters";
        }
        return "";

      case "loanAmount":
        const amount = parseFloat(value);
        if (!value) {
          return "Loan amount is required";
        }
        if (isNaN(amount) || amount <= 0) {
          return "Loan amount must be greater than 0";
        }
        return "";

      case "startDate":
        if (!value) {
          return "Start date is required";
        }
        return "";

      case "monthlyInterestRate":
        const rate = parseFloat(value);
        if (value === "" || value === undefined) {
          return "Interest rate is required";
        }
        if (isNaN(rate) || rate < 0) {
          return "Interest rate must be 0 or greater";
        }
        return "";

      case "months":
        const monthsNum = parseInt(value, 10);
        if (!value) {
          return "Number of months is required";
        }
        if (isNaN(monthsNum) || monthsNum < 1) {
          return "Months must be at least 1";
        }
        if (!Number.isInteger(parseFloat(value))) {
          return "Months must be a whole number";
        }
        return "";

      default:
        return "";
    }
  }, []);

  /**
   * Validates all fields
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  /**
   * Check if form is valid (for button enable/disable)
   */
  const isFormValid = useCallback(() => {
    return Object.keys(formData).every((field) => {
      return !validateField(field, formData[field]);
    });
  }, [formData, validateField]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle input blur (mark as touched)
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (validateForm()) {
      onCalculate({
        borrowerName: formData.borrowerName.trim(),
        loanAmount: parseFloat(formData.loanAmount),
        startDate: formData.startDate,
        monthlyInterestRate: parseFloat(formData.monthlyInterestRate),
        months: parseInt(formData.months, 10),
      });
    }
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    setFormData(initialFormState);
    setErrors(initialErrorsState);
    setTouched({});
    if (onReset) onReset();
  };

  return (
    <Card variant="elevated" padding="lg" className="loan-form">
      <Card.Header>
        <h2 className="loan-form__title">Loan Details</h2>
        <p className="loan-form__subtitle">
          Enter the loan information to generate repayment schedule
        </p>
      </Card.Header>

      <Card.Body>
        <form onSubmit={handleSubmit} className="loan-form__form">
          <Input
            label="Borrower Name"
            name="borrowerName"
            value={formData.borrowerName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.borrowerName ? errors.borrowerName : ""}
            placeholder="Enter borrower's full name"
            required
          />

          <Input
            label="Loan Amount (INR)"
            name="loanAmount"
            type="number"
            value={formData.loanAmount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.loanAmount ? errors.loanAmount : ""}
            placeholder="e.g., 100000"
            min="0"
            step="any"
            required
          />

          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.startDate ? errors.startDate : ""}
            required
          />

          <Input
            label="Monthly Interest Rate (%)"
            name="monthlyInterestRate"
            type="number"
            value={formData.monthlyInterestRate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.monthlyInterestRate ? errors.monthlyInterestRate : ""
            }
            placeholder="e.g., 1"
            hint="Enter monthly rate (e.g., 1 for 1%)"
            min="0"
            step="any"
            required
          />

          <Input
            label="Number of Months"
            name="months"
            type="number"
            value={formData.months}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.months ? errors.months : ""}
            placeholder="e.g., 12"
            min="1"
            step="1"
            required
          />

          <div className="loan-form__actions">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isFormValid()}
            >
              Calculate Schedule
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}

export default LoanForm;
