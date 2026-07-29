import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
} from "react-icons/fa";
import "./Fees.css";

const Fees = () => {
  const [fees] = useState([
    {
      id: 1,
      category: "Tuition Fee",
      amount: 50000,
      paid: 50000,
      balance: 0,
      status: "Paid",
    },
    {
      id: 2,
      category: "Library Fee",
      amount: 2000,
      paid: 2000,
      balance: 0,
      status: "Paid",
    },
    {
      id: 3,
      category: "Lab Fee",
      amount: 5000,
      paid: 5000,
      balance: 0,
      status: "Paid",
    },
    {
      id: 4,
      category: "Exam Fee",
      amount: 3500,
      paid: 0,
      balance: 3500,
      status: "Pending",
    },
  ]);

  return (
    <div className="fees-page">
      <div className="fees-header">
        <h1>
          <FaMoneyBillWave /> Fee Details
        </h1>
        <p>Semester Fee Payment Information</p>
      </div>

      <div className="fees-summary">
        <div className="summary-card">
          <h3>Total Fees</h3>
          <h2>₹60,500</h2>
        </div>

        <div className="summary-card">
          <h3>Paid</h3>
          <h2 className="paid">₹57,000</h2>
        </div>

        <div className="summary-card">
          <h3>Pending</h3>
          <h2 className="pending">₹3,500</h2>
        </div>
      </div>

      <div className="fees-table">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>

          <tbody>
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td>{fee.category}</td>
                <td>₹{fee.amount}</td>
                <td>₹{fee.paid}</td>
                <td>₹{fee.balance}</td>

                <td>
                  {fee.status === "Paid" ? (
                    <span className="paid-status">
                      <FaCheckCircle /> Paid
                    </span>
                  ) : (
                    <span className="pending-status">
                      <FaExclamationTriangle /> Pending
                    </span>
                  )}
                </td>

                <td>
                  {fee.status === "Paid" ? (
                    <button className="download-btn">
                      <FaDownload /> Receipt
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="payment-box">
        <button className="pay-btn">
          Pay Pending Fees
        </button>
      </div>
    </div>
  );
};

export default Fees;