import React, { useState, useCallback, useRef } from "react";
import Card from "../UI/Card";
import Input from "../UI/Input";
import Button from "../UI/Button";
import {
  getTodayISO,
  isoToDigits,
  digitsToISO,
  buildDateDisplay,
  validateDateDigits,
  displayPosToDigitIndex,
  digitIndexToDisplayPos,
} from "../../utils/date";
import { formatIndianInput, numberToWords } from "../../utils/format";
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

  // Local display states
  const [displayLoanAmount, setDisplayLoanAmount] = useState("");
  const [rawDateDigits, setRawDateDigits] = useState(
    isoToDigits(initialFormState.startDate),
  );

  // Ref for the hidden date picker
  const datePickerRef = useRef(null);

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
        if (isNaN(new Date(value).getTime())) {
          return "Invalid date";
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
   * Updates formData.startDate based on current digits
   */
  const updateFormDataFromDigits = useCallback((digits) => {
    if (digits.length === 8) {
      const isoDate = digitsToISO(digits);
      // Only set valid ISO date, otherwise set empty to invalidate
      setFormData((prev) => ({ ...prev, startDate: isoDate || "" }));
    } else {
      // Incomplete date - set empty to invalidate
      setFormData((prev) => ({ ...prev, startDate: "" }));
    }
  }, []);

  /**
   * Handle date input keydown for precise cursor control
   */
  const handleDateKeyDown = (e) => {
    const inputElement = e.target;
    const cursorPos = inputElement.selectionStart;

    if (e.key === "Backspace") {
      e.preventDefault();
      const digitIndex = displayPosToDigitIndex(cursorPos);
      const deleteAt = digitIndex - 1;

      if (deleteAt >= 0 && deleteAt < rawDateDigits.length) {
        const newDigits =
          rawDateDigits.slice(0, deleteAt) + rawDateDigits.slice(deleteAt + 1);
        setRawDateDigits(newDigits);
        updateFormDataFromDigits(newDigits);

        setTimeout(() => {
          const newPos = digitIndexToDisplayPos(deleteAt);
          inputElement.setSelectionRange(newPos, newPos);
        }, 0);
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      const digitIndex = displayPosToDigitIndex(cursorPos);

      if (digitIndex >= 0 && digitIndex < rawDateDigits.length) {
        const newDigits =
          rawDateDigits.slice(0, digitIndex) +
          rawDateDigits.slice(digitIndex + 1);
        setRawDateDigits(newDigits);
        updateFormDataFromDigits(newDigits);

        setTimeout(() => {
          const newPos = digitIndexToDisplayPos(digitIndex);
          inputElement.setSelectionRange(newPos, newPos);
        }, 0);
      }
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const digitIndex = displayPosToDigitIndex(cursorPos);

      let newDigits;
      let newCursorDigitIndex;

      if (digitIndex < rawDateDigits.length) {
        // Replace existing digit
        newDigits =
          rawDateDigits.slice(0, digitIndex) +
          e.key +
          rawDateDigits.slice(digitIndex + 1);
        newCursorDigitIndex = digitIndex + 1;
      } else if (rawDateDigits.length < 8) {
        // Append new digit
        newDigits = rawDateDigits + e.key;
        newCursorDigitIndex = newDigits.length;
      } else {
        // Already full, do nothing
        return;
      }

      setRawDateDigits(newDigits);
      updateFormDataFromDigits(newDigits);

      setTimeout(() => {
        const newPos = digitIndexToDisplayPos(newCursorDigitIndex);
        inputElement.setSelectionRange(newPos, newPos);
      }, 0);
    }
    // Allow other keys (arrows, tab, etc.) to pass through naturally
  };

  /**
   * Handle generic input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "loanAmount") {
      const rawValue = value.replace(/,/g, "");
      if (/[^0-9]/.test(rawValue) && rawValue !== "") return;
      const formattedDisplay = formatIndianInput(rawValue);
      setDisplayLoanAmount(formattedDisplay);
      setFormData((prev) => ({ ...prev, [name]: rawValue }));
      if (touched[name]) {
        const error = validateField(name, rawValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    } else if (name === "startDate") {
      // Fallback for mobile soft keyboard / paste
      // Extract digits from whatever value was entered
      const extractedDigits = value.replace(/\D/g, "").slice(0, 8);
      setRawDateDigits(extractedDigits);
      updateFormDataFromDigits(extractedDigits);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    }
  };

  /**
   * Handle Date Input Focus - position cursor correctly
   */
  const handleDateFocus = (e) => {
    // Allow natural cursor positioning - don't force to end
  };

  /**
   * Handle Date Picker Change
   */
  const handleDatePickerChange = (e) => {
    const isoDate = e.target.value;
    if (isoDate) {
      setFormData((prev) => ({ ...prev, startDate: isoDate }));
      setRawDateDigits(isoToDigits(isoDate));
      setErrors((prev) => ({ ...prev, startDate: "" }));
    }
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e) => {
    const { name } = e.target;

    if (name === "startDate") {
      setTouched((prev) => ({ ...prev, [name]: true }));
      // Do NOT auto-revert to last valid date
      // Just validate and show error if invalid
      if (touched[name] || rawDateDigits.length > 0) {
        const validation = validateDateDigits(rawDateDigits);
        if (
          validation.status === "invalid" ||
          validation.status === "inprogress"
        ) {
          setErrors((prev) => ({
            ...prev,
            startDate: "Valid date is required",
          }));
        } else if (validation.status === "empty") {
          setErrors((prev) => ({
            ...prev,
            startDate: "Start date is required",
          }));
        } else {
          setErrors((prev) => ({ ...prev, startDate: "" }));
        }
      }
    } else {
      const value =
        name === "loanAmount" ? formData.loanAmount : e.target.value;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
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

  const handleReset = () => {
    setFormData(initialFormState);
    setDisplayLoanAmount("");
    setRawDateDigits(isoToDigits(initialFormState.startDate));
    setErrors(initialErrorsState);
    setTouched({});
    if (onReset) onReset();
  };

  const amountInWords = formData.loanAmount
    ? numberToWords(formData.loanAmount)
    : "";

  const loanAmountLabel = (
    <span>
      Loan Amount (INR)
      {amountInWords && (
        <span
          style={{
            marginLeft: "0.5rem",
            fontSize: "0.9em",
            color: "#1e293b",
            fontWeight: "600",
          }}
        >
          — {amountInWords}
        </span>
      )}
    </span>
  );

  // Live date validation status
  const dateValidation = validateDateDigits(rawDateDigits);

  let dateStatusDisplay = null;
  if (dateValidation.status === "valid") {
    dateStatusDisplay = (
      <span
        style={{
          color: "#10b981",
          fontWeight: "600",
          marginLeft: "0.5rem",
          fontSize: "0.9em",
        }}
      >
        ✓ Valid Date
      </span>
    );
  } else if (dateValidation.status === "invalid") {
    dateStatusDisplay = (
      <span
        style={{
          color: "#ef4444",
          fontWeight: "600",
          marginLeft: "0.5rem",
          fontSize: "0.9em",
        }}
      >
        ⚠ {dateValidation.message}
      </span>
    );
  } else if (
    dateValidation.status === "inprogress" &&
    rawDateDigits.length > 0
  ) {
    dateStatusDisplay = (
      <span
        style={{
          color: "#64748b",
          fontWeight: "500",
          marginLeft: "0.5rem",
          fontSize: "0.9em",
        }}
      >
        Typing...
      </span>
    );
  }

  const startDateLabel = (
    <span>
      Start Date
      {dateStatusDisplay}
    </span>
  );

  // Compute display value from raw digits
  const dateDisplayValue = buildDateDisplay(rawDateDigits);

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
            label={loanAmountLabel}
            name="loanAmount"
            type="text"
            inputMode="numeric"
            value={displayLoanAmount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.loanAmount ? errors.loanAmount : ""}
            placeholder="e.g., 1,00,000"
            required
          />

          <div style={{ position: "relative" }}>
            <Input
              label={startDateLabel}
              name="startDate"
              type="text"
              inputMode="numeric"
              value={dateDisplayValue}
              onChange={handleChange}
              onKeyDown={handleDateKeyDown}
              onFocus={handleDateFocus}
              onBlur={handleBlur}
              error={touched.startDate ? errors.startDate : ""}
              placeholder="dd/mm/yyyy"
              required
            />

            {/* Calendar Button */}
            <button
              type="button"
              onClick={() =>
                datePickerRef.current && datePickerRef.current.showPicker()
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "36px",
                background: "transparent",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: "4px",
                zIndex: 2,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Open calendar"
              tabIndex="-1"
            >
              📅
            </button>

            <input
              type="date"
              ref={datePickerRef}
              value={formData.startDate}
              onChange={handleDatePickerChange}
              style={{
                position: "absolute",
                top: "36px",
                right: "10px",
                width: "40px",
                height: "40px",
                opacity: 0,
                cursor: "pointer",
                zIndex: 1,
              }}
              tabIndex="-1"
            />
          </div>

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
