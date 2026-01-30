import React, { useRef, useImperativeHandle, forwardRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Card from "../UI/Card";
import { formatINR } from "../../utils/format";
import "./ScheduleChart.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/**
 * Schedule Chart Component
 * Displays principal and interest trends over time
 *
 * @param {Array} scheduleRows - The schedule data rows
 * @param {React.Ref} ref - Forwarded ref to access chart canvas
 */
const ScheduleChart = forwardRef(({ scheduleRows }, ref) => {
  const chartRef = useRef(null);

  // Expose chart canvas to parent via ref
  useImperativeHandle(ref, () => ({
    getChartCanvas: () => {
      if (chartRef.current) {
        return chartRef.current.canvas;
      }
      return null;
    },
  }));

  // Prepare chart data
  const labels = scheduleRows.map((row) => row.dateLabel);
  const principalData = scheduleRows.map((row) => row.closingPrincipal);
  const interestData = scheduleRows.map((row) => row.interest);
  const totalData = scheduleRows.map((row) => row.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Outstanding Principal",
        data: principalData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: scheduleRows.length > 24 ? 0 : 4,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Monthly Interest",
        data: interestData,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: scheduleRows.length > 24 ? 0 : 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
      {
        label: "Monthly Total Payment",
        data: totalData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: scheduleRows.length > 24 ? 0 : 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
        hidden: true, // Hidden by default, user can toggle
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: {
          size: 13,
          weight: "600",
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatINR(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
          // Show fewer labels on mobile
          maxTicksLimit: 12,
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Principal (₹)",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            // Shorten large numbers
            if (value >= 10000000) {
              return "₹" + (value / 10000000).toFixed(1) + "Cr";
            }
            if (value >= 100000) {
              return "₹" + (value / 100000).toFixed(1) + "L";
            }
            if (value >= 1000) {
              return "₹" + (value / 1000).toFixed(1) + "K";
            }
            return "₹" + value;
          },
          font: {
            size: 11,
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Interest/Total (₹)",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            if (value >= 100000) {
              return "₹" + (value / 100000).toFixed(1) + "L";
            }
            if (value >= 1000) {
              return "₹" + (value / 1000).toFixed(1) + "K";
            }
            return "₹" + value;
          },
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <Card variant="elevated" padding="lg" className="schedule-chart">
      <Card.Header>
        <h3 className="schedule-chart__title">📈 Repayment Trend</h3>
        <p className="schedule-chart__subtitle">
          Principal decreases as Interest decreases over time
        </p>
      </Card.Header>

      <Card.Body>
        <div className="schedule-chart__container">
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </Card.Body>
    </Card>
  );
});

ScheduleChart.displayName = "ScheduleChart";

export default ScheduleChart;
