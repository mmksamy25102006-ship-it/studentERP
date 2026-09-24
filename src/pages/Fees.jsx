import React, { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaCreditCard,
} from "react-icons/fa";
import API from "./../api";
import "./Fees.css";

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // GET LOGGED-IN STUDENT ID
  // =========================

  const getStudentId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      return (
        user?.studentId ||
        localStorage.getItem("studentId") ||
        localStorage.getItem("rollNo") ||
        ""
      );
    } catch (error) {
      return (
        localStorage.getItem("studentId") ||
        localStorage.getItem("rollNo") ||
        ""
      );
    }
  };

  // =========================
  // FETCH FEES
  // =========================

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        setError("");

        const studentId = getStudentId();

        console.log("Logged-in Student ID:", studentId);

        const response = await API.get("/fees");

        const allFees = response.data?.fees || [];

        // Only show the logged-in student's fees
        const studentFees = allFees.filter(
          (fee) =>
            String(fee.regNo || "").trim().toLowerCase() ===
            String(studentId || "").trim().toLowerCase()
        );

        setFees(studentFees);
      } catch (err) {
        console.error("Fetch Student Fees Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load fee information."
        );

        setFees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  // =========================
  // CALCULATIONS
  // =========================

  const totalFees = fees.reduce(
    (sum, fee) => sum + Number(fee.totalFee || 0),
    0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + Number(fee.paidFee || 0),
    0
  );

  const totalPending = fees.reduce(
    (sum, fee) =>
      sum +
      Number(
        fee.pendingFee ??
          Math.max(
            Number(fee.totalFee || 0) -
              Number(fee.paidFee || 0),
            0
          )
      ),
    0
  );

  // =========================================================
  // DOWNLOAD / PRINT FEE RECEIPT
  // =========================================================

  const downloadReceipt = (fee) => {
    const amount = Number(fee.totalFee || 0);
    const paid = Number(fee.paidFee || 0);

    const balance = Number(
      fee.pendingFee ?? Math.max(amount - paid, 0)
    );

    const studentName = fee.name || "Student";
    const regNo = fee.regNo || "N/A";
    const department = fee.department || "N/A";
    const semester = fee.semester || "N/A";
    const status = fee.status || "Paid";

    /*
      Try to find a payment date from common possible fields.
      If your backend uses another field, the receipt will simply
      use today's date.
    */
    const paymentDate =
      fee.paymentDate ||
      fee.paidDate ||
      fee.date ||
      new Date().toISOString();

    const formattedPaymentDate = new Date(
      paymentDate
    ).toLocaleDateString("en-IN");

    const generatedDate =
      new Date().toLocaleDateString("en-IN");

    // Generate a receipt number
    const receiptNumber =
      fee.receiptNo ||
      fee.receiptNumber ||
      `FEE-${Date.now()}`;

    // Open a new window for the printable receipt
    const receiptWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!receiptWindow) {
      alert(
        "Unable to open receipt window. Please allow pop-ups for this site."
      );
      return;
    }

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          Fee Receipt - ${regNo}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;

            background: #f1f5f9;

            color: #1e293b;

            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .receipt-container {
            width: 100%;
            max-width: 800px;

            margin: 0 auto;

            padding: 35px;

            background: #ffffff;

            border:
              1px solid #dbe3ef;

            border-radius: 10px;

            box-shadow:
              0 10px 30px
              rgba(15, 23, 42, 0.08);
          }

          .receipt-header {
            text-align: center;

            padding-bottom: 22px;

            border-bottom:
              2px solid #2563eb;
          }

          .college-name {
            margin: 0;

            color: #172554;

            font-size: 28px;

            font-weight: 700;

            letter-spacing: 0.5px;
          }

          .erp-title {
            margin-top: 7px;

            color: #2563eb;

            font-size: 14px;

            font-weight: 600;

            letter-spacing: 1px;

            text-transform: uppercase;
          }

          .receipt-title {
            margin-top: 20px;

            color: #334155;

            font-size: 21px;

            font-weight: 700;
          }

          .receipt-number {
            margin-top: 7px;

            color: #64748b;

            font-size: 13px;
          }

          .student-section {
            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 18px;

            margin-top: 28px;

            padding: 20px;

            background: #f8fafc;

            border:
              1px solid #e2e8f0;

            border-radius: 8px;
          }

          .info-item {
            display: flex;

            flex-direction: column;

            gap: 5px;
          }

          .info-label {
            color: #64748b;

            font-size: 11px;

            font-weight: 600;

            text-transform: uppercase;

            letter-spacing: 0.5px;
          }

          .info-value {
            color: #1e293b;

            font-size: 14px;

            font-weight: 600;
          }

          .payment-section {
            margin-top: 25px;
          }

          .section-title {
            margin-bottom: 12px;

            color: #172554;

            font-size: 16px;

            font-weight: 700;
          }

          .payment-table {
            width: 100%;

            border-collapse: collapse;
          }

          .payment-table th {
            padding: 13px;

            color: #ffffff;

            background: #2563eb;

            font-size: 13px;

            text-align: left;
          }

          .payment-table td {
            padding: 14px;

            color: #334155;

            border-bottom:
              1px solid #e2e8f0;

            font-size: 13px;
          }

          .payment-table th:last-child,
          .payment-table td:last-child {
            text-align: right;
          }

          .amount {
            font-weight: 600;
          }

          .paid-amount {
            color: #15803d;

            font-weight: 700;
          }

          .balance-amount {
            color: ${
              balance > 0
                ? "#dc2626"
                : "#15803d"
            };

            font-weight: 700;
          }

          .status-section {
            display: flex;

            align-items: center;

            justify-content: space-between;

            margin-top: 25px;

            padding: 15px 18px;

            background: ${
              status === "Paid"
                ? "#f0fdf4"
                : "#fff7ed"
            };

            border:
              1px solid
              ${
                status === "Paid"
                  ? "#bbf7d0"
                  : "#fed7aa"
              };

            border-radius: 8px;
          }

          .status-label {
            color: #475569;

            font-size: 13px;

            font-weight: 600;
          }

          .status-value {
            color: ${
              status === "Paid"
                ? "#15803d"
                : "#c2410c"
            };

            font-size: 14px;

            font-weight: 700;
          }

          .receipt-footer {
            display: flex;

            justify-content: space-between;

            margin-top: 45px;

            padding-top: 20px;

            border-top:
              1px solid #e2e8f0;
          }

          .footer-item {
            color: #64748b;

            font-size: 11px;
          }

          .footer-item strong {
            display: block;

            margin-top: 4px;

            color: #334155;

            font-size: 12px;
          }

          .print-button {
            display: block;

            width: 100%;

            margin-top: 30px;

            padding: 13px;

            border: none;

            border-radius: 7px;

            color: #ffffff;

            background: #2563eb;

            font-size: 14px;

            font-weight: 600;

            cursor: pointer;
          }

          .print-button:hover {
            background: #1d4ed8;
          }

          @media print {

            body {
              padding: 0;

              background: #ffffff;
            }

            .receipt-container {
              max-width: none;

              padding: 25px;

              border: none;

              border-radius: 0;

              box-shadow: none;
            }

            .print-button {
              display: none;
            }

            @page {
              size: A4;

              margin: 15mm;
            }
          }

          @media (max-width: 600px) {

            body {
              padding: 10px;
            }

            .receipt-container {
              padding: 20px;
            }

            .student-section {
              grid-template-columns: 1fr;
            }

            .receipt-footer {
              flex-direction: column;

              gap: 12px;
            }
          }

        </style>
      </head>

      <body>

        <div class="receipt-container">

          <div class="receipt-header">

            <h1 class="college-name">
              COLLEGE ERP SYSTEM
            </h1>

            <div class="erp-title">
              Student Fee Management
            </div>

            <div class="receipt-title">
              FEE PAYMENT RECEIPT
            </div>

            <div class="receipt-number">
              Receipt No: ${receiptNumber}
            </div>

          </div>


          <div class="student-section">

            <div class="info-item">
              <span class="info-label">
                Student Name
              </span>

              <span class="info-value">
                ${studentName}
              </span>
            </div>


            <div class="info-item">
              <span class="info-label">
                Registration Number
              </span>

              <span class="info-value">
                ${regNo}
              </span>
            </div>


            <div class="info-item">
              <span class="info-label">
                Department
              </span>

              <span class="info-value">
                ${department}
              </span>
            </div>


            <div class="info-item">
              <span class="info-label">
                Semester
              </span>

              <span class="info-value">
                ${semester}
              </span>
            </div>

          </div>


          <div class="payment-section">

            <div class="section-title">
              Payment Details
            </div>

            <table class="payment-table">

              <thead>

                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>

              </thead>

              <tbody>

                <tr>
                  <td>
                    Total Fee
                  </td>

                  <td class="amount">
                    ₹${amount.toLocaleString("en-IN")}
                  </td>
                </tr>


                <tr>
                  <td>
                    Amount Paid
                  </td>

                  <td class="paid-amount">
                    ₹${paid.toLocaleString("en-IN")}
                  </td>
                </tr>


                <tr>
                  <td>
                    Balance
                  </td>

                  <td class="balance-amount">
                    ₹${balance.toLocaleString("en-IN")}
                  </td>
                </tr>

              </tbody>

            </table>

          </div>


          <div class="status-section">

            <span class="status-label">
              Payment Status
            </span>

            <span class="status-value">
              ${status}
            </span>

          </div>


          <div class="receipt-footer">

            <div class="footer-item">
              Payment Date
              <strong>
                ${formattedPaymentDate}
              </strong>
            </div>


            <div class="footer-item">
              Generated Date
              <strong>
                ${generatedDate}
              </strong>
            </div>


            <div class="footer-item">
              Registration No.
              <strong>
                ${regNo}
              </strong>
            </div>

          </div>


          <button
            class="print-button"
            onclick="window.print()"
          >
            Print / Save as PDF
          </button>

        </div>

      </body>
      </html>
    `);

    receiptWindow.document.close();

    // Give the browser time to render the receipt
    setTimeout(() => {
      receiptWindow.focus();
      receiptWindow.print();
    }, 500);
  };

  // =========================
  // PAYMENT
  // =========================

  const handlePayment = () => {
    if (totalPending === 0) {
      alert("There are no pending fees.");
      return;
    }

    alert(
      `Pending fee amount: ₹${totalPending.toLocaleString(
        "en-IN"
      )}`
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="student-fees-page">

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

        </div>


        <div className="student-fees-table-card">

          <div className="student-fees-table-header">

            <div>

              <h2>Loading Fees...</h2>

              <p>
                Please wait while we load your fee information.
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

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
            {totalPending === 0
              ? "Fully Paid"
              : "Pending"}
          </strong>

        </div>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="student-fees-table-card">

          <div className="student-fees-table-header">

            <div>

              <h2>Unable to Load Fees</h2>

              <p>{error}</p>

            </div>

          </div>

        </div>
      )}


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

              {fees.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No fee records found for your account.
                  </td>

                </tr>

              ) : (

                fees.map((fee) => {

                  const amount = Number(
                    fee.totalFee || 0
                  );

                  const paid = Number(
                    fee.paidFee || 0
                  );

                  const balance = Number(
                    fee.pendingFee ??
                      Math.max(
                        amount - paid,
                        0
                      )
                  );

                  const status =
                    fee.status ||
                    (balance === 0
                      ? "Paid"
                      : paid === 0
                      ? "Unpaid"
                      : "Partial");

                  return (

                    <tr key={fee._id}>

                      {/* CATEGORY */}

                      <td>

                        <div className="student-fees-category">

                          <div className="student-fees-category-icon">
                            <FaMoneyBillWave />
                          </div>

                          <span>
                            Semester {fee.semester}
                          </span>

                        </div>

                      </td>


                      {/* TOTAL */}

                      <td>

                        <strong className="student-fees-amount">
                          ₹{amount.toLocaleString("en-IN")}
                        </strong>

                      </td>


                      {/* PAID */}

                      <td>

                        <strong className="student-fees-paid-amount">
                          ₹{paid.toLocaleString("en-IN")}
                        </strong>

                      </td>


                      {/* BALANCE */}

                      <td>

                        <strong
                          className={
                            balance > 0
                              ? "student-fees-balance pending"
                              : "student-fees-balance"
                          }
                        >
                          ₹{balance.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        {status === "Paid" ? (

                          <span className="student-fees-status paid">

                            <FaCheckCircle />

                            Paid

                          </span>

                        ) : (

                          <span className="student-fees-status pending">

                            <FaExclamationTriangle />

                            {status}

                          </span>

                        )}

                      </td>


                      {/* RECEIPT */}

                      <td>

                        {status === "Paid" ? (

                          <button
                            className="student-fees-receipt-btn"
                            onClick={() =>
                              downloadReceipt(fee)
                            }
                            title="Download Fee Receipt"
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

                  );

                })

              )}

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