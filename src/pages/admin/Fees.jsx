import React, { useState, useEffect } from "react";
import "./Fees.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
} from "react-icons/fa";
import API from "../../api";

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    regNo: "",
    name: "",
    department: "",
    semester: "",
    totalFee: "",
    paidFee: "",
  });

  // =====================================================
  // FETCH FEES FROM BACKEND
  // =====================================================

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);

      const response = await API.get("/fees");

      if (response.data.success) {
        setFees(response.data.fees || []);
      } else {
        setFees([]);
      }
    } catch (error) {
      console.error("Fetch Fees Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load fee records"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      regNo: "",
      name: "",
      department: "",
      semester: "",
      totalFee: "",
      paidFee: "",
    });

    setEditIndex(null);
  };

  // =====================================================
  // ADD / UPDATE FEE
  // =====================================================

  const saveFee = async () => {
    if (
      !form.regNo.trim() ||
      !form.name.trim() ||
      !form.department.trim() ||
      !form.semester.trim() ||
      form.totalFee === "" ||
      form.paidFee === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    const total = Number(form.totalFee);
    const paid = Number(form.paidFee);

    if (Number.isNaN(total) || Number.isNaN(paid)) {
      alert("Fee amounts must be valid numbers");
      return;
    }

    if (total < 0 || paid < 0) {
      alert("Fee amounts cannot be negative");
      return;
    }

    if (paid > total) {
      alert("Paid fee cannot be greater than total fee");
      return;
    }

    try {
      setSaving(true);

      const feeData = {
        regNo: form.regNo.trim(),
        name: form.name.trim(),
        department: form.department.trim(),
        semester: form.semester.trim(),
        totalFee: total,
        paidFee: paid,
      };

      // =================================================
      // UPDATE EXISTING FEE
      // =================================================

      if (editIndex !== null) {
        const feeId = fees[editIndex]?._id;

        if (!feeId) {
          alert("Fee record ID is missing");
          return;
        }

        const response = await API.put(
          `/fees/${feeId}`,
          feeData
        );

        if (response.data.success) {
          alert("Fee updated successfully");

          await fetchFees();

          resetForm();
        }

        return;
      }

      // =================================================
      // ADD NEW FEE
      // =================================================

      const response = await API.post("/fees", feeData);

      if (response.data.success) {
        alert("Fee added successfully");

        await fetchFees();

        resetForm();
      }
    } catch (error) {
      console.error("Save Fee Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save fee record"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT FEE
  // =====================================================

  const editFee = (index) => {
    const fee = fees[index];

    if (!fee) {
      return;
    }

    setForm({
      regNo: fee.regNo || "",
      name: fee.name || "",
      department: fee.department || "",
      semester: fee.semester || "",
      totalFee: fee.totalFee ?? "",
      paidFee: fee.paidFee ?? "",
    });

    setEditIndex(index);
  };

  // =====================================================
  // DELETE FEE
  // =====================================================

  const deleteFee = async (index) => {
    if (!window.confirm("Delete this record?")) {
      return;
    }

    const fee = fees[index];

    if (!fee?._id) {
      alert("Fee record ID is missing");
      return;
    }

    try {
      const response = await API.delete(
        `/fees/${fee._id}`
      );

      if (response.data.success) {
        alert("Fee deleted successfully");

        await fetchFees();

        // If deleted record was being edited
        if (editIndex === index) {
          resetForm();
        }
      }
    } catch (error) {
      console.error("Delete Fee Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete fee record"
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText = search.toLowerCase();

  const filtered = fees.filter((f) => {
    const name = String(f.name || "").toLowerCase();
    const regNo = String(f.regNo || "").toLowerCase();

    return (
      name.includes(searchText) ||
      regNo.includes(searchText)
    );
  });

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fees-page">
      <h2>Student Fee Management</h2>

      <div className="fee-count">
        Total Students : <strong>{fees.length}</strong>
      </div>

      {/* =========================
          FEE FORM
      ========================= */}

      <div className="fee-form">
        <input
          type="text"
          placeholder="Register Number"
          name="regNo"
          value={form.regNo}
          onChange={handleChange}
        />

        <input
          type="text"
          placeholder="Student Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="text"
          placeholder="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
        />

        <input
          type="text"
          placeholder="Semester"
          name="semester"
          value={form.semester}
          onChange={handleChange}
        />

        <input
          type="number"
          placeholder="Total Fee"
          name="totalFee"
          value={form.totalFee}
          onChange={handleChange}
          min="0"
        />

        <input
          type="number"
          placeholder="Paid Fee"
          name="paidFee"
          value={form.paidFee}
          onChange={handleChange}
          min="0"
        />

        <button onClick={saveFee} disabled={saving}>
          {saving ? (
            <>
              <FaSave /> Saving...
            </>
          ) : editIndex !== null ? (
            <>
              <FaSave /> Update
            </>
          ) : (
            <>
              <FaPlus /> Add Fee
            </>
          )}
        </button>

        {/* Cancel edit */}
        {editIndex !== null && (
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="search-box">
        <FaSearch />

        <input
          type="text"
          placeholder="Search Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =========================
          FEE TABLE
      ========================= */}

      <table>
        <thead>
          <tr>
            <th>Reg No</th>
            <th>Name</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Total Fee</th>
            <th>Paid</th>
            <th>Pending</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                Loading fee records...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                {search
                  ? "No matching fee records found"
                  : "No fee records found"}
              </td>
            </tr>
          ) : (
            filtered.map((item, index) => (
              <tr key={item._id || index}>
                <td>{item.regNo}</td>

                <td>{item.name}</td>

                <td>{item.department}</td>

                <td>{item.semester}</td>

                <td>
                  ₹{Number(item.totalFee || 0).toLocaleString("en-IN")}
                </td>

                <td>
                  ₹{Number(item.paidFee || 0).toLocaleString("en-IN")}
                </td>

                <td>
                  ₹
                  {Number(item.pendingFee || 0).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td>
                  <span
                    className={
                      item.status === "Paid"
                        ? "paid"
                        : item.status === "Partial"
                        ? "partial"
                        : "unpaid"
                    }
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => editFee(index)}
                    disabled={saving}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteFee(index)}
                    disabled={saving}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Fees;