```markdown
# SamitiHisab

A simple and transparent loan repayment calculator built specifically for Mohila Samiti and women-led cooperative loan groups.

SamitiHisab বিশেষভাবে মহিলাদের পরিচালিত সমিতি (Mohila Samiti) এবং কো-অপারেটিভ ঋণ গ্রুপের জন্য তৈরি একটি সহজ ও স্বচ্ছ ঋণ হিসাব করার অ্যাপ।

---

## Table of Contents

1. [Project Introduction](#1-project-introduction)
2. [Key Features](#2-key-features)
3. [Application Pages & User Flow](#3-application-pages--user-flow)
4. [Loan Calculation Logic](#4-loan-calculation-logic)
5. [Folder & File Structure](#5-folder--file-structure)
6. [Component Architecture](#6-component-architecture)
7. [Utility & Business Logic Modules](#7-utility--business-logic-modules)
8. [State Management & Data Flow](#8-state-management--data-flow)
9. [Styling Strategy](#9-styling-strategy)
10. [Charts & Data Visualization](#10-charts--data-visualization)
11. [PDF Export System](#11-pdf-export-system)
12. [Validation & Error Handling](#12-validation--error-handling)
13. [Accessibility & UX Principles](#13-accessibility--ux-principles)
14. [Local Setup & Installation](#14-local-setup--installation)
15. [Environment & Configuration](#15-environment--configuration)
16. [Future Enhancements & Roadmap](#16-future-enhancements--roadmap)
17. [Contribution Guidelines](#17-contribution-guidelines)
18. [Known Limitations](#18-known-limitations)
19. [License & Usage Notes](#19-license--usage-notes)

---

## 1. Project Introduction

### What the Application Does

SamitiHisab is a single-page application (SPA) that generates detailed loan repayment schedules using an equal principal EMI structure. Users input loan parameters and receive a complete month-by-month breakdown of payments, including principal repayment, interest charges, and outstanding balances.

The application produces three outputs:

1. A summary card displaying key loan metrics
2. An interactive chart visualizing repayment trends
3. A detailed tabular schedule of all payments

Users can export all results to a professionally formatted PDF document.

### Who It Is For

- **Individual borrowers** seeking to understand loan repayment structures
- **Financial advisors** requiring quick amortization calculations
- **Small business owners** planning loan-based financing
- **Accountants** needing clear repayment documentation
- **Non-technical users** who need financial calculations without spreadsheet expertise
- **Members and coordinators** of Mohila Samiti and women-led cooperative loan groups

### Core Design Philosophy

1. **Clarity over complexity**: Every calculation is transparent and verifiable
2. **Professional output**: Results are suitable for formal documentation
3. **Zero friction**: No registration, no backend, instant results
4. **Mobile-first**: Full functionality on any device
5. **Separation of concerns**: Business logic isolated from presentation
6. **Raw simplicity**: No CSS frameworks, no unnecessary abstractions

---

## 2. Key Features

### Loan Calculation

- Equal principal EMI calculation (principal divided equally across tenure)
- Monthly interest computed on opening principal balance
- Automatic rounding to two decimal places
- Final month adjustment to ensure principal closes exactly to zero
- Support for any loan amount, interest rate, and tenure

### Schedule Table

- Row 0 displays initial disbursement state
- Rows 1 through N show monthly repayment details
- Columns: Date, Loan Capital (closing principal), EMI, Interest, Total
- Horizontal scrolling on mobile with sticky first column
- Expandable view for schedules exceeding 12 rows

### Charts

- Dual-axis line chart using Chart.js
- Primary axis: Outstanding principal over time
- Secondary axis: Monthly interest and total payment
- Interactive tooltips with INR formatting
- Responsive sizing across devices
- Toggle visibility of individual datasets

### PDF Export

- Single-click PDF generation
- Includes summary block, chart image, and full schedule table
- Professional formatting with headers and page numbers
- Automatic filename generation with borrower name and date
- Browser-based generation (no server required)

### UX Principles

- Form validation with inline error messages
- Disabled submit button until all fields valid
- Loading state during calculation
- Scroll-to-results on mobile after calculation
- Empty state guidance when no results exist
- Scroll hint for mobile table users

---

## 3. Application Pages & User Flow

### Landing Page

**Route**: `/`

**Purpose**: Marketing and onboarding entry point.

**Structure**:

- Hero section with headline, description, and call-to-action button
- Statistics bar (free to use, unlimited calculations, no signup)
- Feature grid (6 cards describing capabilities)
- How It Works section (3-step process)
- Final call-to-action section
- Footer

**Navigation**: Primary CTA links to `/dashboard`.

### Dashboard Page

**Route**: `/dashboard`

**Purpose**: Core application functionality.

**Structure**:

- Page header with title and description
- Two-column layout on desktop (form left, results right)
- Single-column stacked layout on mobile
- Sticky form on desktop for easy reference while scrolling results

**Components displayed**:

- LoanForm (always visible)
- ResultsSummary (after calculation)
- ScheduleChart (after calculation)
- ScheduleTable (after calculation)
- PdfExportButton (after calculation)

### End-to-End User Journey

1. User lands on homepage
2. User clicks "Start Calculating" or "Dashboard" in navbar
3. User enters: borrower name, loan amount, start date, interest rate, months
4. Validation errors appear inline if inputs invalid
5. User clicks "Calculate Schedule" (enabled only when form valid)
6. Loading indicator appears briefly
7. Results section populates with summary, chart, and table
8. On mobile, page scrolls to results automatically
9. User reviews data, optionally expands table to see all rows
10. User clicks "Download PDF" to export results
11. PDF downloads with complete documentation
12. User can click "Reset" to clear form and start over

---

## 4. Loan Calculation Logic

This section documents the exact calculation methodology implemented in `src/utils/loanSchedule.js`.

### Terminology

| Term                  | Definition                                                          |
| --------------------- | ------------------------------------------------------------------- |
| Principal             | The original loan amount borrowed                                   |
| EMI                   | Equated Monthly Installment (principal portion only in this system) |
| Opening Principal     | Outstanding balance at the start of a month                         |
| Closing Principal     | Outstanding balance at the end of a month                           |
| Monthly Interest Rate | Interest percentage applied per month (not annual)                  |
| Tenure                | Total number of repayment months (N)                                |

### EMI Definition (Equal Principal)

This application uses an **equal principal repayment** structure, not a flat EMI structure.
```

EMI Principal = Loan Amount / Number of Months

```

Each month, the borrower repays an equal portion of the principal. The interest varies monthly based on the outstanding balance.

This differs from a traditional flat EMI where the total payment (principal + interest) remains constant.

### Interest Calculation Rule

Interest is calculated on the **opening principal** of each month:

```

Monthly Interest = Opening Principal \* (Monthly Interest Rate / 100)

```

As the principal decreases, so does the interest charge.

### Month-by-Month Flow

**Row 0 (Disbursement)**:
- Date = Start Date
- Closing Principal = Loan Amount
- EMI = 0
- Interest = 0
- Total = 0

**Rows 1 through N (Repayments)**:

For each month `i` from 1 to N:

```

1. Opening Principal = Previous Closing Principal
2. Interest = Opening Principal \* (Rate / 100)
3. If i < N:
   EMI Principal = Loan Amount / N (rounded to 2 decimals)
   If i = N:
   EMI Principal = Opening Principal (to close balance exactly)
4. Closing Principal = Opening Principal - EMI Principal
5. Total = EMI Principal + Interest
6. Date = Start Date + i months

````

### Worked Example

**Inputs**:
- Loan Amount: 100,000 INR
- Monthly Interest Rate: 1%
- Tenure: 10 months
- Start Date: 01 Jan 2025

**Calculations**:

Base EMI Principal = 100,000 / 10 = 10,000.00

| Month | Date | Opening | Interest (1%) | EMI | Closing | Total |
|-------|------|---------|---------------|-----|---------|-------|
| 0 | 01 Jan 2025 | 100,000.00 | 0.00 | 0.00 | 100,000.00 | 0.00 |
| 1 | 01 Feb 2025 | 100,000.00 | 1,000.00 | 10,000.00 | 90,000.00 | 11,000.00 |
| 2 | 01 Mar 2025 | 90,000.00 | 900.00 | 10,000.00 | 80,000.00 | 10,900.00 |
| 3 | 01 Apr 2025 | 80,000.00 | 800.00 | 10,000.00 | 70,000.00 | 10,800.00 |
| 4 | 01 May 2025 | 70,000.00 | 700.00 | 10,000.00 | 60,000.00 | 10,700.00 |
| 5 | 01 Jun 2025 | 60,000.00 | 600.00 | 10,000.00 | 50,000.00 | 10,600.00 |
| 6 | 01 Jul 2025 | 50,000.00 | 500.00 | 10,000.00 | 40,000.00 | 10,500.00 |
| 7 | 01 Aug 2025 | 40,000.00 | 400.00 | 10,000.00 | 30,000.00 | 10,400.00 |
| 8 | 01 Sep 2025 | 30,000.00 | 300.00 | 10,000.00 | 20,000.00 | 10,300.00 |
| 9 | 01 Oct 2025 | 20,000.00 | 200.00 | 10,000.00 | 10,000.00 | 10,200.00 |
| 10 | 01 Nov 2025 | 10,000.00 | 100.00 | 10,000.00 | 0.00 | 10,100.00 |

**Totals**:
- Total Interest Paid: 5,500.00
- Total Amount Paid: 105,500.00

### Rounding and Last-Month Adjustment

All monetary values are rounded to 2 decimal places using:

```javascript
Math.round((value + Number.EPSILON) * 100) / 100
````

The `Number.EPSILON` addition prevents floating-point errors.

On the final month, instead of using the calculated EMI principal, the system uses the exact opening principal. This ensures the closing principal is precisely zero, avoiding residual balances from accumulated rounding differences.

---

## 5. Folder & File Structure

```
src/
├── index.js                    # Application entry point
├── index.css                   # Global styles and CSS variables
├── App.js                      # Root component
├── routes/
│   └── AppRouter.js            # Route definitions
├── pages/
│   ├── LandingPage/
│   │   ├── LandingPage.js      # Landing page component
│   │   └── LandingPage.css     # Landing page styles
│   └── DashboardPage/
│       ├── DashboardPage.js    # Dashboard page component
│       └── DashboardPage.css   # Dashboard page styles
├── components/
│   ├── Layout/
│   │   ├── Container.js        # Width-constraining wrapper
│   │   ├── Container.css
│   │   ├── Navbar.js           # Top navigation bar
│   │   ├── Navbar.css
│   │   ├── Footer.js           # Page footer
│   │   └── Footer.css
│   ├── UI/
│   │   ├── Button.js           # Reusable button component
│   │   ├── Button.css
│   │   ├── Card.js             # Container card component
│   │   ├── Card.css
│   │   ├── Input.js            # Form input component
│   │   ├── Input.css
│   │   ├── Alert.js            # Alert/notification component
│   │   └── Alert.css
│   └── LoanCalculator/
│       ├── LoanForm.js         # Loan input form
│       ├── LoanForm.css
│       ├── ResultsSummary.js   # Summary card display
│       ├── ResultsSummary.css
│       ├── ScheduleTable.js    # Amortization table
│       ├── ScheduleTable.css
│       ├── ScheduleChart.js    # Chart visualization
│       ├── ScheduleChart.css
│       ├── PdfExportButton.js  # PDF generation button
│       └── PdfExportButton.css
└── utils/
    ├── loanSchedule.js         # Core calculation logic
    ├── date.js                 # Date manipulation helpers
    └── format.js               # Number/currency formatting
```

### Folder Responsibilities

| Folder                       | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `routes/`                    | React Router configuration                   |
| `pages/`                     | Top-level page components (one per route)    |
| `components/Layout/`         | Structural components used across pages      |
| `components/UI/`             | Generic, reusable UI primitives              |
| `components/LoanCalculator/` | Domain-specific components for loan features |
| `utils/`                     | Pure functions with no React dependencies    |

### Why This Structure

1. **Colocation**: Each component has its CSS file adjacent for easy maintenance
2. **Separation**: Business logic in `utils/` is testable without React
3. **Scalability**: New features can be added as new component folders
4. **Discoverability**: Folder names match their functional purpose
5. **Independence**: UI components have no domain knowledge

---

## 6. Component Architecture

### Page-Level Components

#### LandingPage

- **Location**: `src/pages/LandingPage/LandingPage.js`
- **Purpose**: Marketing and entry point
- **Children**: Navbar, Container, Button, Card, Footer
- **State**: None (stateless presentation)

#### DashboardPage

- **Location**: `src/pages/DashboardPage/DashboardPage.js`
- **Purpose**: Main calculator interface
- **Children**: Navbar, Container, LoanForm, ResultsSummary, ScheduleChart, ScheduleTable, PdfExportButton, Footer
- **State**:
  - `results` (object or null): Calculation output
  - `isCalculating` (boolean): Loading state
- **Refs**: `chartRef` passed to ScheduleChart for PDF export access

### Reusable UI Components

#### Container

- **Props**: `children`, `className`, `size` (default/narrow/wide/full)
- **Purpose**: Constrains content width with responsive padding

#### Navbar

- **Props**: None
- **Purpose**: Navigation with logo and links
- **Features**: Active route highlighting via `useLocation`

#### Footer

- **Props**: None
- **Purpose**: Copyright and tagline display

#### Button

- **Props**: `variant` (primary/secondary/outline/ghost/danger), `size` (sm/md/lg), `fullWidth`, `disabled`, `type`, `onClick`, `children`
- **Purpose**: Consistent button styling across application

#### Card

- **Props**: `variant` (default/elevated/bordered), `padding` (none/sm/md/lg), `children`
- **Sub-components**: `Card.Header`, `Card.Body`, `Card.Footer`
- **Purpose**: Content grouping with consistent styling

#### Input

- **Props**: `label`, `error`, `hint`, `required`, `type`, `id`, `name`, `value`, `onChange`, `onBlur`, `placeholder`, `disabled`
- **Purpose**: Form inputs with integrated labels and error display
- **Features**: ARIA attributes for accessibility

#### Alert

- **Props**: `variant` (info/success/warning/error), `title`, `children`, `onClose`
- **Purpose**: User notifications (currently defined but not actively used)

### Loan Calculator Components

#### LoanForm

- **Props**: `onCalculate` (function), `onReset` (function)
- **Purpose**: Collects loan parameters from user
- **State**:
  - `formData`: Object with borrowerName, loanAmount, startDate, monthlyInterestRate, months
  - `errors`: Validation error messages per field
  - `touched`: Tracks which fields have been interacted with
- **Behavior**: Validates on blur and change (if touched), calls `onCalculate` with parsed data

#### ResultsSummary

- **Props**: `results` (object from buildLoanSchedule)
- **Purpose**: Displays key metrics in a grid of cards
- **Displays**: Borrower name, loan amount, interest rate, tenure, EMI, total interest, total payment

#### ScheduleChart

- **Props**: `scheduleRows` (array)
- **Ref**: Exposes `getChartCanvas()` method for PDF export
- **Purpose**: Visualizes principal and interest trends
- **Library**: react-chartjs-2 with Chart.js

#### ScheduleTable

- **Props**: `scheduleRows` (array)
- **Purpose**: Displays full amortization schedule
- **Features**:
  - Show/hide rows beyond 12
  - Horizontal scroll on mobile
  - Sticky first column
  - Scroll hint for mobile users

#### PdfExportButton

- **Props**: `results` (object), `chartRef` (ref to ScheduleChart)
- **Purpose**: Generates and downloads PDF
- **State**: `isExporting` (boolean for loading state)
- **Libraries**: jsPDF, jspdf-autotable, html2canvas

### Component Interaction and Data Flow

```
DashboardPage
    │
    ├── LoanForm
    │       │
    │       └── onCalculate(formData) ────┐
    │                                      │
    │   ┌──────────────────────────────────┘
    │   │
    │   ▼
    │   buildLoanSchedule(formData)
    │   │
    │   └── returns { scheduleRows, emiPrincipal, ... }
    │                │
    │                ▼
    │           setResults(result)
    │                │
    ├────────────────┼────────────────────────┐
    │                │                        │
    ▼                ▼                        ▼
ResultsSummary   ScheduleChart           ScheduleTable
(reads results)  (reads scheduleRows)    (reads scheduleRows)
                      │
                      │ ref
                      ▼
               PdfExportButton
               (reads results + chartRef)
```

---

## 7. Utility & Business Logic Modules

### loanSchedule.js

**Location**: `src/utils/loanSchedule.js`

**Exports**:

```javascript
buildLoanSchedule({
  borrowerName,
  loanAmount,
  startDate,
  monthlyInterestRate,
  months,
});
```

Returns:

```javascript
{
  scheduleRows: [
    {
      id: Number,           // 0 for initial, 1-N for payments
      dateISO: String,      // "YYYY-MM-DD"
      dateLabel: String,    // "DD MMM YYYY"
      openingPrincipal: Number,
      closingPrincipal: Number,
      emi: Number,
      interest: Number,
      total: Number,
      isInitialRow: Boolean
    },
    // ...
  ],
  emiPrincipal: Number,
  borrowerName: String,
  loanAmount: Number,
  monthlyInterestRate: Number,
  months: Number
}
```

```javascript
calculateTotalInterest(scheduleRows); // Returns sum of all interest
calculateTotalPayment(scheduleRows); // Returns sum of all totals
```

### date.js

**Location**: `src/utils/date.js`

**Exports**:

```javascript
addMonths(date, months);
// Adds months to date, handling month-end edge cases
// Example: Jan 31 + 1 month = Feb 28 (not Mar 3)

formatDateLabel(date);
// Returns "DD MMM YYYY" format for display

formatDateISO(date);
// Returns "YYYY-MM-DD" format for data

getTodayISO();
// Returns today's date in ISO format for form default
```

### format.js

**Location**: `src/utils/format.js`

**Exports**:

```javascript
formatINR(number, (showSymbol = true));
// Formats to Indian number system: "1,00,000.00" or "₹1,00,000.00"

roundToTwo(number);
// Rounds to 2 decimal places with EPSILON correction

parseNumber(string);
// Parses string to number, removing commas and currency symbols

formatPercent(number);
// Returns "X.XX%" format
```

### Reason for Isolating Business Logic

1. **Testability**: Pure functions can be unit tested without React rendering
2. **Reusability**: Logic can be used in future backend or other contexts
3. **Maintainability**: Calculation changes don't require component modifications
4. **Clarity**: Components remain focused on presentation

---

## 8. State Management & Data Flow

### Where State Lives

This application uses **local component state** exclusively. There is no global state management library (Redux, Context, etc.).

| State               | Location        | Type       |
| ------------------- | --------------- | ---------- |
| Form data           | LoanForm        | `useState` |
| Validation errors   | LoanForm        | `useState` |
| Touched fields      | LoanForm        | `useState` |
| Calculation results | DashboardPage   | `useState` |
| Loading indicator   | DashboardPage   | `useState` |
| Table expansion     | ScheduleTable   | `useState` |
| PDF export loading  | PdfExportButton | `useState` |

### How Form Data Flows

1. User types in Input components
2. `onChange` updates `formData` state in LoanForm
3. `onBlur` marks field as touched and triggers validation
4. Validation errors update `errors` state
5. Submit button disabled state derived from validation
6. On submit, `onCalculate` prop called with parsed data
7. DashboardPage receives data and calls `buildLoanSchedule`
8. Results stored in DashboardPage state
9. Results passed as props to display components

### How Results Propagate to UI

```
DashboardPage.results
    │
    ├──► ResultsSummary.results
    │       └── Reads: borrowerName, loanAmount, monthlyInterestRate,
    │                  months, emiPrincipal, scheduleRows
    │
    ├──► ScheduleChart.scheduleRows
    │       └── Maps: dateLabel, closingPrincipal, interest, total
    │
    ├──► ScheduleTable.scheduleRows
    │       └── Maps: all row fields for table cells
    │
    └──► PdfExportButton.results + chartRef
            └── Uses all data for PDF generation
```

### Why This Approach

1. **Simplicity**: No external state library overhead
2. **Locality**: State lives close to where it's used
3. **Predictability**: Single source of truth per feature area
4. **Performance**: No unnecessary re-renders from global state changes
5. **Scalability**: For this application size, local state is sufficient

---

## 9. Styling Strategy

### CSS Organization

Each component has a co-located CSS file with the same base name:

```
ComponentName.js
ComponentName.css
```

Global styles and CSS custom properties are defined in `src/index.css`.

### CSS Custom Properties

The application uses a design token system via CSS variables:

```css
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Neutrals */
  --color-white: #ffffff;
  --color-gray-50 through --color-gray-900

  /* Typography */
  --font-size-xs through --font-size-4xl

  /* Spacing */
  --spacing-xs through --spacing-3xl

  /* Border Radius */
  --radius-sm through --radius-full

  /* Shadows */
  --shadow-sm through --shadow-xl

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
}
```

### Naming Conventions

The application uses BEM-inspired naming:

```css
.component-name {
}
.component-name__element {
}
.component-name__element--modifier {
}
```

Examples:

```css
.schedule-table {
}
.schedule-table__header {
}
.schedule-table__row--initial {
}
```

### Responsiveness Approach

Mobile-first breakpoints:

```css
/* Base styles: mobile */
.element {
}

/* Tablet */
@media (min-width: 640px) {
}

/* Desktop */
@media (min-width: 1024px) {
}

/* Large desktop */
@media (min-width: 1200px) {
}
```

Key responsive behaviors:

- Single column to multi-column grid transitions
- Font size scaling
- Padding adjustments
- Table horizontal scrolling with sticky column
- Chart height adjustments

### Why Raw CSS

1. **No build complexity**: No preprocessor or CSS-in-JS runtime
2. **Performance**: No JavaScript overhead for styling
3. **Debugging**: Standard browser DevTools work perfectly
4. **Learning curve**: Any developer can understand immediately
5. **Portability**: Styles can be extracted for other projects
6. **Specificity control**: Full control over cascade

---

## 10. Charts & Data Visualization

### Library

- **Chart.js**: Core charting library (v4.x)
- **react-chartjs-2**: React wrapper for Chart.js (v5.x)

### Chart Type

Line chart with multiple datasets on dual Y-axes.

### Data Mapping

```javascript
// X-axis labels
labels = scheduleRows.map((row) => row.dateLabel);

// Dataset 1: Principal (left Y-axis)
data = scheduleRows.map((row) => row.closingPrincipal);

// Dataset 2: Interest (right Y-axis)
data = scheduleRows.map((row) => row.interest);

// Dataset 3: Total Payment (right Y-axis, hidden by default)
data = scheduleRows.map((row) => row.total);
```

### Chart Configuration

```javascript
{
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',      // Show all datasets for hovered X value
    intersect: false
  },
  scales: {
    y: {
      position: 'left',
      title: 'Principal'
    },
    y1: {
      position: 'right',
      title: 'Interest/Total',
      grid: { drawOnChartArea: false }  // No grid lines for secondary axis
    }
  }
}
```

### UX Decisions

1. **Dual axes**: Principal and interest have different scales
2. **Area fill**: Principal dataset filled to emphasize declining balance
3. **Hidden dataset**: Total payment available but not shown by default to reduce clutter
4. **Dynamic point radius**: Points hidden when >24 data points for cleaner lines
5. **Abbreviated labels**: Large numbers shown as "1.5L" or "2.3Cr" on axes
6. **Tooltip formatting**: Full INR format in tooltips for precision

---

## 11. PDF Export System

### Tools Used

| Library         | Purpose                          |
| --------------- | -------------------------------- |
| jsPDF           | PDF document creation            |
| jspdf-autotable | Table generation for jsPDF       |
| html2canvas     | Chart canvas to image conversion |

### Generation Process

1. User clicks "Download PDF"
2. `isExporting` state set to true (shows loading spinner)
3. New jsPDF document created (A4 portrait)
4. Header rendered with gradient background
5. Summary section rendered as text blocks
6. Chart canvas accessed via ref and converted to image via html2canvas
7. Chart image added to PDF
8. Schedule table generated using autoTable plugin
9. Footer with page numbers added to all pages
10. PDF saved with auto-generated filename
11. `isExporting` state set to false

### PDF Content Structure

```
┌─────────────────────────────────────┐
│ [Blue Header Bar]                   │
│ Loan Repayment Schedule             │
│ Generated on DD Month YYYY          │
├─────────────────────────────────────┤
│ Loan Summary                        │
│ ┌─────────────────────────────────┐ │
│ │ Borrower: Name                  │ │
│ │ Loan Amount: ₹X,XX,XXX.XX       │ │
│ │ Interest Rate: X.XX%            │ │
│ │ Tenure: X months                │ │
│ │ Monthly EMI: ₹X,XXX.XX          │ │
│ │ Total Interest: ₹X,XXX.XX       │ │
│ │ Total Payment: ₹X,XX,XXX.XX     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Repayment Trend Chart               │
│ [Chart Image]                       │
├─────────────────────────────────────┤
│ Repayment Schedule                  │
│ ┌───┬──────┬────────┬─────┬─────┐  │
│ │ # │ Date │ Capital│ EMI │ ... │  │
│ ├───┼──────┼────────┼─────┼─────┤  │
│ │ 0 │ ...  │ ...    │ ... │ ... │  │
│ │ 1 │ ...  │ ...    │ ... │ ... │  │
│ └───┴──────┴────────┴─────┴─────┘  │
├─────────────────────────────────────┤
│ Page 1 of N          LoanCalc Pro   │
└─────────────────────────────────────┘
```

### Browser Considerations

- PDF generation is entirely client-side
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- No server round-trip required
- Chart rendering depends on html2canvas compatibility
- Large schedules may span multiple pages (handled automatically)

---

## 12. Validation & Error Handling

### Input Validation Rules

| Field               | Rules                                   |
| ------------------- | --------------------------------------- |
| borrowerName        | Required, minimum 2 characters          |
| loanAmount          | Required, must be > 0                   |
| startDate           | Required                                |
| monthlyInterestRate | Required, must be >= 0                  |
| months              | Required, must be >= 1, must be integer |

### Validation Implementation

```javascript
// Field validated on:
// 1. Blur (first interaction)
// 2. Change (after first interaction)

const validateField = (name, value) => {
  switch (name) {
    case "borrowerName":
      if (!value.trim()) return "Borrower name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return "";
    // ... other fields
  }
};
```

### UX Behavior for Invalid Input

1. Error message appears below input field
2. Input border turns red
3. Error message styled in red text
4. Calculate button remains disabled
5. Errors clear when user corrects input
6. Fields only show errors after being touched (blur)

### Defensive Logic

- All numeric inputs parsed with `parseFloat`/`parseInt`
- NaN checks before calculations
- Rounding applied consistently via `roundToTwo`
- Final month uses remaining principal to prevent floating-point accumulation
- Empty form fields default to safe values

---

## 13. Accessibility & UX Principles

### Non-Technical User Focus

1. **Clear labels**: Every input has a descriptive label
2. **Helpful hints**: Interest rate input explains "monthly rate"
3. **Plain language**: No financial jargon without explanation
4. **Visual hierarchy**: Important numbers highlighted
5. **Guided flow**: Empty state explains what to do

### Accessibility Features

- Semantic HTML elements (`<nav>`, `<main>`, `<footer>`, `<table>`)
- `aria-invalid` on inputs with errors
- `aria-describedby` linking inputs to error messages
- `role="alert"` on error messages
- Keyboard-navigable form
- Visible focus states
- Sufficient color contrast

### Mobile Responsiveness

- Touch-friendly button sizes (minimum 44px tap targets)
- Horizontal scroll for table with visual hint
- Sticky column for table context
- Collapsible table rows to reduce scrolling
- Appropriately sized fonts (never below 12px)
- Adequate spacing between interactive elements

### Readability and Clarity

- Indian number format (1,00,000) for INR familiarity
- Consistent 2-decimal precision for money
- Date format familiar to Indian users (DD MMM YYYY)
- Color coding for highlighted summary items
- Monospace font for numeric columns

---

## 14. Local Setup & Installation

### Prerequisites

- Node.js v16.x or higher
- npm v8.x or higher (or yarn)

### Installation Steps

```bash
# Clone or create project directory
mkdir loan-calculator
cd loan-calculator

# Initialize Create React App (if starting fresh)
npx create-react-app .

# Install dependencies
npm install react-router-dom chart.js react-chartjs-2 html2canvas jspdf jspdf-autotable

# Replace src/ contents with application files

# Start development server
npm start
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "react-scripts": "5.0.1"
  }
}
```

### How to Run

```bash
# Development
npm start
# Opens http://localhost:3000

# Production build
npm run build
# Output in build/ directory

# Run tests
npm test
```

---

## 15. Environment & Configuration

### Current Environment Assumptions

- Client-side only (no backend)
- No environment variables required
- No API keys needed
- No database connection
- All calculations performed in browser
- PDF generated client-side

### CRA Configuration

The application uses Create React App defaults:

- Webpack bundling (hidden)
- Babel transpilation (hidden)
- ESLint for linting
- Jest for testing
- Development server with hot reload

### Notes for Future Backend Integration

If a backend is added in the future:

1. **API Base URL**: Add `REACT_APP_API_URL` environment variable
2. **Authentication**: Consider adding auth context provider
3. **State Management**: May need to upgrade to React Query or Redux
4. **Form Submission**: Replace local calculation with API call
5. **PDF Generation**: Could move to server-side for consistency

---

## 16. Future Enhancements & Roadmap

### Logical Next Features

1. **Save/Load Calculations**
   - LocalStorage persistence
   - Named calculation profiles
   - History of past calculations

2. **Comparison Mode**
   - Side-by-side comparison of two loan scenarios
   - Visual diff of payment schedules

3. **Additional EMI Types**
   - Flat EMI (constant total payment)
   - Reducing balance EMI
   - Balloon payment option

4. **Enhanced Charting**
   - Stacked area chart for principal vs interest
   - Pie chart for total breakdown
   - Interactive zoom and pan

5. **Print Optimization**
   - Direct print CSS
   - Print-specific layout

### Backend Ideas

1. **User Accounts**
   - Save calculations to account
   - Share calculations via link
   - Team/organization features

2. **API for Calculations**
   - RESTful API for calculation engine
   - Webhook for automated processing
   - Batch calculation support

3. **Document Generation**
   - Server-side PDF with templates
   - Excel export
   - Email delivery of reports

### SaaS Expansion Possibilities

1. **Multi-tenant Support**
   - White-label branding
   - Custom domains
   - Organization management

2. **Premium Features**
   - Advanced analytics
   - Custom report templates
   - API access for integrations

3. **Integrations**
   - Accounting software (Tally, Zoho)
   - CRM systems
   - Banking APIs

---

## 17. Contribution Guidelines

### Code Style Expectations

1. **Components**
   - Functional components only
   - Hooks for state and effects
   - Props destructuring at top
   - Clear JSDoc comments for props

2. **CSS**
   - BEM naming convention
   - Use CSS variables for values
   - Mobile-first media queries
   - Co-locate with component

3. **JavaScript**
   - ES6+ syntax
   - Meaningful variable names
   - Short functions with single responsibility
   - Comments for non-obvious logic

### How to Add Features Safely

1. **New Component**

   ```
   src/components/[Category]/
   ├── NewComponent.js
   └── NewComponent.css
   ```

2. **New Utility**

   ```
   src/utils/newUtility.js
   ```

3. **New Page**

   ```
   src/pages/NewPage/
   ├── NewPage.js
   └── NewPage.css
   ```

   Update `AppRouter.js` with new route.

4. **Testing Changes**
   - Run `npm start` and test all flows
   - Test on mobile viewport
   - Verify PDF export still works
   - Check console for errors

### Folder Discipline

- UI components go in `components/UI/`
- Layout components go in `components/Layout/`
- Domain-specific components go in `components/[DomainName]/`
- Pure functions go in `utils/`
- Page components go in `pages/[PageName]/`
- Never put CSS in JS files
- Never put business logic in components

---

## 18. Known Limitations

### Intentional Constraints

| Limitation                | Reason                                  |
| ------------------------- | --------------------------------------- |
| No user accounts          | Simplicity, no backend needed           |
| No data persistence       | Client-only by design                   |
| Equal principal EMI only  | Specific use case requirement           |
| Monthly interest only     | Keeps calculations simple               |
| INR currency only         | Target audience is Indian users         |
| No annual rate conversion | Avoids confusion, expects monthly input |

### What the App Does NOT Support

1. **Flat EMI calculation** (where total payment is constant)
2. **Annual interest rate input** (user must calculate monthly)
3. **Variable interest rates** (rate changes during tenure)
4. **Prepayment scenarios** (early principal payments)
5. **Grace periods** (payment holidays)
6. **Compound interest within month** (simple monthly calculation)
7. **Multiple currencies** (INR only)
8. **Negative amortization** (interest capitalization)
9. **Backend integration** (purely client-side)
10. **Offline PWA mode** (requires network for initial load)

---

## 19. License & Usage Notes

### License

This project is provided as-is for educational and professional use. No specific open-source license has been applied. Users should add an appropriate license (MIT, Apache 2.0, etc.) before public distribution.

### Usage Notes

1. **Accuracy Disclaimer**: This calculator is for estimation purposes. Official loan documents from financial institutions should be used for legally binding calculations.

2. **Rounding**: Two-decimal precision is used throughout. Minor discrepancies with bank calculations may occur due to different rounding methods.

3. **Browser Support**: Tested on modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). Internet Explorer is not supported.

4. **Data Privacy**: No data is transmitted to any server. All calculations and PDF generation occur entirely in the user's browser.

5. **Commercial Use**: Users should review and add appropriate licensing before using this code in commercial products.

---

## Document Information

| Property         | Value                          |
| ---------------- | ------------------------------ |
| Application Name | SamitiHisab                    |
| Version          | 1.0.0                          |
| Framework        | React 18                       |
| Build Tool       | Create React App               |
| Primary Language | JavaScript (ES6+)              |
| Styling          | Raw CSS with custom properties |
| Last Updated     | January 2025                   |

```

```
