import React, { useState } from "react";
import Card from "../UI/Card";
import { formatINR } from "../../utils/format";
import "./ScheduleTable.css";

/**
 * Schedule Table Component
 * Displays the amortization schedule in a responsive table
 *
 * @param {Array} scheduleRows - The schedule data rows
 */
function ScheduleTable({ scheduleRows }) {
  const [showAll, setShowAll] = useState(false);

  // Show first 6 rows initially if more than 12 rows
  const displayRows =
    showAll || scheduleRows.length <= 12
      ? scheduleRows
      : scheduleRows.slice(0, 6);

  const hasMoreRows = scheduleRows.length > 12 && !showAll;

  return (
    <Card variant="elevated" padding="none" className="schedule-table">
      <div className="schedule-table__header">
        <h3 className="schedule-table__title">📋 Repayment Schedule</h3>
        <span className="schedule-table__count">
          {scheduleRows.length} row{scheduleRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Mobile scroll hint */}
      <div className="schedule-table__scroll-hint">
        <span>👆</span>
        <span>Swipe left to see more columns</span>
      </div>

      <div className="schedule-table__wrapper">
        <table className="schedule-table__table">
          <thead>
            <tr>
              <th className="schedule-table__th schedule-table__th--sticky">
                #
              </th>
              <th className="schedule-table__th">Date</th>
              <th className="schedule-table__th schedule-table__th--right">
                Loan Capital
              </th>
              <th className="schedule-table__th schedule-table__th--right">
                EMI
              </th>
              <th className="schedule-table__th schedule-table__th--right">
                Interest
              </th>
              <th className="schedule-table__th schedule-table__th--right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr
                key={row.id}
                className={`schedule-table__row ${row.isInitialRow ? "schedule-table__row--initial" : ""}`}
              >
                <td className="schedule-table__td schedule-table__td--sticky">
                  {row.id}
                </td>
                <td className="schedule-table__td">{row.dateLabel}</td>
                <td className="schedule-table__td schedule-table__td--right schedule-table__td--money">
                  {formatINR(row.closingPrincipal)}
                </td>
                <td className="schedule-table__td schedule-table__td--right schedule-table__td--money">
                  {row.isInitialRow ? "-" : formatINR(row.emi)}
                </td>
                <td className="schedule-table__td schedule-table__td--right schedule-table__td--money">
                  {row.isInitialRow ? "-" : formatINR(row.interest)}
                </td>
                <td className="schedule-table__td schedule-table__td--right schedule-table__td--money schedule-table__td--total">
                  {row.isInitialRow ? "-" : formatINR(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMoreRows && (
        <div className="schedule-table__footer">
          <button
            className="schedule-table__show-more"
            onClick={() => setShowAll(true)}
          >
            Show all {scheduleRows.length} rows
          </button>
        </div>
      )}

      {showAll && scheduleRows.length > 12 && (
        <div className="schedule-table__footer">
          <button
            className="schedule-table__show-more"
            onClick={() => setShowAll(false)}
          >
            Show less
          </button>
        </div>
      )}
    </Card>
  );
}

export default ScheduleTable;
