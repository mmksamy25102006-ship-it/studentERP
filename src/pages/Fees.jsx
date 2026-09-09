import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaCreditCard,
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

  const totalFees = fees.reduce(
    (sum, fee) => sum + Number(fee.amount || 0),
    0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + Number(fee.paid || 0),
    0
  );

  const totalPending = fees.reduce(
    (sum, fee) => sum + Number(fee.balance || 0),
    0
  );

  const downloadReceipt = (fee) => {
    const receiptContent = `
College ERP
Fee Payment Receipt

Category: ${fee.category}
Total Amount: ₹${fee.amount}
Paid Amount: ₹${fee.paid}
Balance: ₹${fee.balance}
Status: ${fee.status}

Generated: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([receiptContent], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fee.category.replace(/\s+/g, "_")}_Receipt.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handlePayment = () => {
    if (totalPending === 0) {
      alert("There are no pending fees.");
      return;
    }

    alert(
      `Pending fee amount: ₹${totalPending.toLocaleString("en-IN")}`
    );
  };

  return (
    <div className="student-fees-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="student-fees-header">

        <div className="student-fees-header-left">

          <div className="student-fees-title-icon">
            <FaMoneyBillWave />
          </div>

          <div>
            <h1>Fee Details</h1>

            <p>
              View your semester fee payment information
            </p>
          </div>

        </div>

        <div className="student-fees-header-badge">
          <span>Payment Status</span>

          <strong>
            {totalPending === 0 ? "Fully Paid" : "Pending"}
          </strong>
        </div>

      </div>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="student-fees-summary">

        <div className="student-fees-summary-card total">

          <div className="student-fees-summary-icon">
            <FaMoneyBillWave />
          </div>

          <div>
            <span>Total Fees</span>

            <strong>
              ₹{totalFees.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        <div className="student-fees-summary-card paid">

          <div className="student-fees-summary-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Total Paid</span>

            <strong>
              ₹{totalPaid.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        <div className="student-fees-summary-card pending">

          <div className="student-fees-summary-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Pending Amount</span>

            <strong>
              ₹{totalPending.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

      </div>


      {/* =========================
          FEE TABLE CARD
      ========================= */}

      <div className="student-fees-table-card">

        <div className="student-fees-table-header">

          <div>
            <h2>Fee Payment Details</h2>

            <p>
              Complete breakdown of your semester fees
            </p>
          </div>

          <div className="student-fees-record-count">
            {fees.length} Records
          </div>

        </div>


        <div className="student-fees-table-wrapper">

          <table className="student-fees-table">

            <thead>

              <tr>
                <th>Category</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>

            </thead>


            <tbody>

              {fees.map((fee) => (

                <tr key={fee.id}>

                  {/* CATEGORY */}

                  <td>

                    <div className="student-fees-category">

                      <div className="student-fees-category-icon">
                        <FaMoneyBillWave />
                      </div>

                      <span>
                        {fee.category}
                      </span>

                    </div>

                  </td>


                  {/* TOTAL */}

                  <td>

                    <strong className="student-fees-amount">
                      ₹{fee.amount.toLocaleString("en-IN")}
                    </strong>

                  </td>


                  {/* PAID */}

                  <td>

                    <strong className="student-fees-paid-amount">
                      ₹{fee.paid.toLocaleString("en-IN")}
                    </strong>

                  </td>


                  {/* BALANCE */}

                  <td>

                    <strong
                      className={
                        fee.balance > 0
                          ? "student-fees-balance pending"
                          : "student-fees-balance"
                      }
                    >
                      ₹{fee.balance.toLocaleString("en-IN")}
                    </strong>

                  </td>


                  {/* STATUS */}

                  <td>

                    {fee.status === "Paid" ? (

                      <span className="student-fees-status paid">

                        <FaCheckCircle />

                        Paid

                      </span>

                    ) : (

                      <span className="student-fees-status pending">

                        <FaExclamationTriangle />

                        Pending

                      </span>

                    )}

                  </td>


                  {/* RECEIPT */}

                  <td>

                    {fee.status === "Paid" ? (

                      <button
                        className="student-fees-receipt-btn"
                        onClick={() => downloadReceipt(fee)}
                      >

                        <FaDownload />

                        Receipt

                      </button>

                    ) : (

                      <span className="student-fees-no-receipt">
                        —
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================
          PAYMENT BOX
      ========================= */}

      {totalPending > 0 && (

        <div className="student-fees-payment-box">

          <div className="student-fees-payment-info">

            <div className="student-fees-payment-icon">
              <FaCreditCard />
            </div>

            <div>

              <h3>
                Pending Payment
              </h3>

              <p>
                You have ₹
                {totalPending.toLocaleString("en-IN")}
                {" "}remaining to pay.
              </p>

            </div>

          </div>


          <button
            className="student-fees-pay-btn"
            onClick={handlePayment}
          >

            <FaCreditCard />

            Pay Pending Fees

          </button>

        </div>

      )}

    </div>
  );
};

export default Fees;