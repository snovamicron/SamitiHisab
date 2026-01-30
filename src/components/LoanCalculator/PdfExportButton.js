import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import Button from "../UI/Button";
import { formatINR, formatPercent } from "../../utils/format";
import {
  calculateTotalInterest,
  calculateTotalPayment,
} from "../../utils/loanSchedule";
import "./PdfExportButton.css";

/**
 * PDF Export Button Component
 * Generates and downloads a PDF containing the loan summary, chart, and schedule
 *
 * @param {Object} results - The calculation results
 * @param {Object} chartRef - Reference to the chart component
 */
function PdfExportButton({ results, chartRef }) {
  const [isExporting, setIsExporting] = useState(false);

  const {
    borrowerName,
    loanAmount,
    monthlyInterestRate,
    months,
    emiPrincipal,
    scheduleRows,
  } = results;

  /**
   * Generates and downloads the PDF
   */
  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Colors
      const primaryColor = [37, 99, 235];
      const grayColor = [100, 116, 139];
      const darkColor = [15, 23, 42];

      // Header
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 35, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Loan Repayment Schedule", margin, 15);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Generated on ${new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`,
        margin,
        25,
      );

      yPos = 45;

      // Summary Section
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Loan Summary", margin, yPos);
      yPos += 8;

      // Summary box
      pdf.setDrawColor(...grayColor);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 3, 3, "S");

      const totalInterest = calculateTotalInterest(scheduleRows);
      const totalPayment = calculateTotalPayment(scheduleRows);

      const summaryData = [
        { label: "Borrower Name:", value: borrowerName },
        { label: "Loan Amount:", value: formatINR(loanAmount) },
        {
          label: "Monthly Interest Rate:",
          value: `${formatPercent(monthlyInterestRate)}`,
        },
        { label: "Tenure:", value: `${months} months` },
        { label: "Monthly Principal EMI:", value: formatINR(emiPrincipal) },
        { label: "Total Interest:", value: formatINR(totalInterest) },
        { label: "Total Payment:", value: formatINR(totalPayment) },
      ];

      pdf.setFontSize(10);
      const colWidth = (pageWidth - margin * 2 - 20) / 2;
      let summaryY = yPos + 7;
      let summaryX = margin + 5;

      summaryData.forEach((item, index) => {
        const col = index % 2;
        if (index > 0 && col === 0) {
          summaryY += 7;
        }

        const x = summaryX + col * colWidth;

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...grayColor);
        pdf.text(item.label, x, summaryY);

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...darkColor);
        pdf.text(item.value, x + 45, summaryY);
      });

      yPos += 60;

      // Chart Section
      if (chartRef && chartRef.current) {
        try {
          const canvas = chartRef.current.getChartCanvas();
          if (canvas) {
            // Create a higher resolution canvas for better PDF quality
            const chartCanvas = await html2canvas(canvas.parentElement, {
              scale: 2,
              backgroundColor: "#ffffff",
              logging: false,
            });

            const chartImgData = chartCanvas.toDataURL("image/png");
            const chartWidth = pageWidth - margin * 2;
            const chartHeight =
              (chartCanvas.height / chartCanvas.width) * chartWidth;

            // Check if chart fits on current page
            if (yPos + chartHeight + 10 > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...darkColor);
            pdf.text("Repayment Trend Chart", margin, yPos);
            yPos += 5;

            pdf.addImage(
              chartImgData,
              "PNG",
              margin,
              yPos,
              chartWidth,
              chartHeight,
            );
            yPos += chartHeight + 10;
          }
        } catch (chartError) {
          console.warn("Could not export chart:", chartError);
        }
      }

      // Schedule Table Section
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...darkColor);
      pdf.text("Repayment Schedule", margin, yPos);
      yPos += 5;

      // Prepare table data
      const tableHeaders = [
        ["#", "Date", "Loan Capital", "EMI", "Interest", "Total"],
      ];
      const tableData = scheduleRows.map((row) => [
        row.id.toString(),
        row.dateLabel,
        formatINR(row.closingPrincipal, false),
        row.isInitialRow ? "-" : formatINR(row.emi, false),
        row.isInitialRow ? "-" : formatINR(row.interest, false),
        row.isInitialRow ? "-" : formatINR(row.total, false),
      ]);

      // Generate table using autoTable
      pdf.autoTable({
        head: tableHeaders,
        body: tableData,
        startY: yPos,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          textColor: darkColor,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { halign: "left", cellWidth: 28 },
          2: { halign: "right", cellWidth: 30 },
          3: { halign: "right", cellWidth: 28 },
          4: { halign: "right", cellWidth: 28 },
          5: { halign: "right", cellWidth: 28 },
        },
        didParseCell: function (data) {
          // Highlight initial row
          if (data.section === "body" && data.row.index === 0) {
            data.cell.styles.fillColor = [219, 234, 254];
          }
        },
      });

      // Footer on each page
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(...grayColor);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        pdf.text(
          "LoanCalc Pro - Professional Loan Premium Calculator",
          margin,
          pageHeight - 10,
        );
      }

      // Download PDF
      const fileName = `loan-schedule-${borrowerName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pdf-export">
      <Button
        variant="secondary"
        size="lg"
        onClick={handleExport}
        disabled={isExporting}
        className="pdf-export__button"
      >
        {isExporting ? (
          <>
            <span className="pdf-export__spinner"></span>
            Generating PDF...
          </>
        ) : (
          <>📄 Download PDF</>
        )}
      </Button>
      <p className="pdf-export__hint">
        Export summary, chart, and full schedule to PDF
      </p>
    </div>
  );
}

export default PdfExportButton;
