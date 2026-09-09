import React, { useState, useEffect } from "react";
import "./Fees.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
} from "react-icons/fa";

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    regNo: "",
    name: "",
    department: "",
    semester: "",
    totalFee: "",
    paidFee: "",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("fees")) || [];
    setFees(data);
  }, []);

  useEffect(() => {
    localStorage.setItem("fees", JSON.stringify(fees));
  }, [fees]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveFee = () => {
    if (
      !form.regNo ||
      !form.name ||
      !form.department ||
      !form.semester ||
      !form.totalFee ||
      !form.paidFee
    ) {
      alert("Please fill all fields");
      return;
    }

    const total = Number(form.totalFee);
    const paid = Number(form.paidFee);
    const pending = total - paid;

    let status = "Paid";

    if (paid === 0) status = "Unpaid";
    else if (pending > 0) status = "Partial";

    const record = {
      ...form,
      pendingFee: pending,
      status,
    };

    if (editIndex !== null) {
      const updated = [...fees];
      updated[editIndex] = record;
      setFees(updated);
      setEditIndex(null);
    } else {
      setFees([...fees, record]);
    }

    setForm({
      regNo: "",
      name: "",
      department: "",
      semester: "",
      totalFee: "",
      paidFee: "",
    });
  };

  const editFee = (index) => {
    setForm(fees[index]);
    setEditIndex(index);
  };

  const deleteFee = (index) => {
    if (window.confirm("Delete this record?")) {
      setFees(fees.filter((_, i) => i !== index));
    }
  };

  const filtered = fees.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.regNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fees-page">
      <h2>Student Fee Management</h2>

      <div className="fee-count">
        Total Students : <strong>{fees.length}</strong>
      </div>

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
        />

        <input
          type="number"
          placeholder="Paid Fee"
          name="paidFee"
          value={form.paidFee}
          onChange={handleChange}
        />

        <button onClick={saveFee}>
          {editIndex !== null ? (
            <>
              <FaSave /> Update
            </>
          ) : (
            <>
              <FaPlus /> Add Fee
            </>
          )}
        </button>
      </div>

      <div className="search-box">
        <FaSearch />
        <input
          type="text"
          placeholder="Search Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
          {filtered.map((item, index) => (
            <tr key={index}>
              <td>{item.regNo}</td>
              <td>{item.name}</td>
              <td>{item.department}</td>
              <td>{item.semester}</td>
              <td>₹{item.totalFee}</td>
              <td>₹{item.paidFee}</td>
              <td>₹{item.pendingFee}</td>

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
                >
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteFee(index)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Fees;
