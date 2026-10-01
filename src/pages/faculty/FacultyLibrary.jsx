import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FaBook,
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBookOpen,
  FaLayerGroup,
  FaUserPlus,
  FaUndo,
  FaTrash,
  FaPencilAlt,
  FaTimes,
  FaSyncAlt,
  FaExclamationTriangle,
  FaBookmark,
  FaRupeeSign,
  FaBoxes,
  FaUserGraduate,
} from "react-icons/fa";

import API from "./../../api";
import BookCover from "./../../components/BookCover";
import { formatDate } from "./../../utils/format";

import "./FacultyLibrary.css";

const EMPTY_BOOK = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  publisher: "",
  shelf: "",
  coverUrl: "",
  totalCopies: 1,
  finePerDay: 10,
  description: "",
};

const getFacultyId = () => {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    return (
      savedUser.facultyId ||
      localStorage.getItem("facultyId") ||
      ""
    );
  } catch {
    return localStorage.getItem("facultyId") || "";
  }
};

const FacultyLibrary = () => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("catalogue");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [issueFilter, setIssueFilter] = useState("issued");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [issueModal, setIssueModal] = useState(null);
  const [issueForm, setIssueForm] = useState({
    studentId: "",
    studentName: "",
    dueDate: "",
  });

  const [bookModal, setBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK);
  const [bookErrors, setBookErrors] = useState({});

  const facultyId = getFacultyId();

  // Default due date = 14 days from today
  const defaultDueDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 14);

    return date.toISOString().slice(0, 10);
  };

  // ===================================================
  // NOTICE
  // ===================================================

  const notify = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadData = useCallback(async () => {
    try {
      const [booksResponse, issuesResponse, reservationsResponse] =
        await Promise.all([
          API.get("/library"),
          API.get("/library/issues/all"),
          API.get("/library/reservations", {
            params: { status: "pending" },
          }),
        ]);

      setBooks(
        Array.isArray(booksResponse.data)
          ? booksResponse.data
          : booksResponse.data?.books || []
      );

      setIssues(issuesResponse.data?.issues || []);

      setReservations(
        reservationsResponse.data?.reservations || []
      );
    } catch (error) {
      console.error("Faculty Library Error:", error);

      notify(
        "Library service is unavailable. Redeploy the backend to enable management.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(""), 4000);

    return () => clearTimeout(timer);
  }, [message]);

  // ===================================================
  // STATISTICS
  // ===================================================

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        books.map((book) => book.category).filter(Boolean)
      ),
    ];
  }, [books]);

  const totalCopies = useMemo(() => {
    return books.reduce(
      (total, book) => total + (book.totalCopies || 0),
      0
    );
  }, [books]);

  const availableCopies = useMemo(() => {
    return books.reduce(
      (total, book) => total + (book.availableCopies || 0),
      0
    );
  }, [books]);

  const activeIssues = useMemo(() => {
    return issues.filter((issue) => issue.status === "issued");
  }, [issues]);

  const overdueIssues = useMemo(() => {
    return activeIssues.filter((issue) => issue.overdue);
  }, [activeIssues]);

  // ===================================================
  // FILTERS
  // ===================================================

  const filteredBooks = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return books.filter((book) => {
      const matchesSearch =
        !searchText ||
        book.title.toLowerCase().includes(searchText) ||
        book.author.toLowerCase().includes(searchText) ||
        String(book.isbn || "")
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  const filteredIssues = useMemo(() => {
    if (issueFilter === "all") {
      return issues;
    }

    return issues.filter(
      (issue) => issue.status === issueFilter
    );
  }, [issues, issueFilter]);

  // ===================================================
  // ISSUE BOOK
  // ===================================================

  const openIssueModal = (book, reservation = null) => {
    setIssueModal(book);

    setIssueForm({
      studentId: reservation?.studentId || "",
      studentName: reservation?.studentName || "",
      dueDate: defaultDueDate(),
    });
  };

  const handleIssue = async (event) => {
    event.preventDefault();

    if (!issueModal) {
      return;
    }

    if (!issueForm.studentId.trim()) {
      notify("Student ID is required", "error");

      return;
    }

    if (!issueForm.dueDate) {
      notify("Due date is required", "error");

      return;
    }

    setSaving(true);

    try {
      const response = await API.post("/library/issue", {
        bookId: issueModal._id,
        studentId: issueForm.studentId.trim(),
        studentName: issueForm.studentName.trim(),
        dueDate: issueForm.dueDate,
        facultyId,
      });

      notify(
        `"${issueModal.title}" issued to ${response.data.issue.studentId}`
      );

      setIssueModal(null);

      await loadData();
    } catch (error) {
      console.error("Issue Book Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to issue book",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RETURN BOOK
  // ===================================================

  const handleReturn = async (issue) => {
    setSaving(true);

    try {
      const response = await API.post("/library/return", {
        issueId: issue._id,
      });

      const title = issue.book?.title || issue.bookTitle;

      notify(
        `"${title}" returned${
          response.data.fine > 0
            ? ` - fine ₹${response.data.fine}`
            : ""
        }`
      );

      await loadData();
    } catch (error) {
      console.error("Return Book Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to return book",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // ADD / EDIT BOOK
  // ===================================================

  const openAddModal = () => {
    setEditingBook(null);
    setBookForm(EMPTY_BOOK);
    setBookErrors({});
    setBookModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);

    setBookForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      shelf: book.shelf || "",
      coverUrl: book.coverUrl || "",
      totalCopies: book.totalCopies || 1,
      finePerDay: book.finePerDay || 0,
      description: book.description || "",
    });

    setBookErrors({});
    setBookModal(true);
  };

  const validateBook = () => {
    const errors = {};

    if (!bookForm.title.trim()) {
      errors.title = "Title is required";
    }

    if (!bookForm.author.trim()) {
      errors.author = "Author is required";
    }

    if (!bookForm.category.trim()) {
      errors.category = "Category is required";
    }

    if (!bookForm.isbn.trim()) {
      errors.isbn = "ISBN is required";
    }

    if (
      !bookForm.totalCopies ||
      Number(bookForm.totalCopies) < 1
    ) {
      errors.totalCopies = "At least 1 copy is required";
    }

    setBookErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSaveBook = async (event) => {
    event.preventDefault();

    if (!validateBook()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        category: bookForm.category.trim(),
        isbn: bookForm.isbn.trim(),
        publisher: bookForm.publisher.trim(),
        shelf: bookForm.shelf.trim(),
        coverUrl: bookForm.coverUrl.trim(),
        totalCopies: Number(bookForm.totalCopies),
        finePerDay: Number(bookForm.finePerDay) || 0,
        description: bookForm.description.trim(),
      };

      if (editingBook) {
        await API.put(
          `/library/${editingBook._id}`,
          payload
        );

        notify("Book updated successfully");
      } else {
        await API.post("/library", payload);

        notify("Book added successfully");
      }

      setBookModal(false);
      setEditingBook(null);

      await loadData();
    } catch (error) {
      console.error("Save Book Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to save book",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // DELETE BOOK
  // ===================================================

  const handleDelete = async (book) => {
    if (
      !window.confirm(
        `Delete "${book.title}" from the library?`
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      await API.delete(`/library/${book._id}`);

      notify(`"${book.title}" deleted`);

      await loadData();
    } catch (error) {
      console.error("Delete Book Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to delete book",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  if (loading) {
    return (
      <div className="fl-page">
        <div className="fl-status">
          <FaSyncAlt className="fl-spin" />
          Loading library...
        </div>
      </div>
    );
  }

  return (
    <div className="fl-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="fl-header">
        <div>
          <h1>
            <FaBook />
            Library Management
          </h1>

          <p>
            Issue, return and maintain the college library
          </p>
        </div>

        <button
          className="fl-add-btn"
          onClick={openAddModal}
        >
          <FaPlus />
          Add Book
        </button>
      </div>


      {message && (
        <div
          className={`fl-notice ${messageType}`}
        >
          {messageType === "error" ? (
            <FaExclamationTriangle />
          ) : (
            <FaCheckCircle />
          )}
          {message}
        </div>
      )}


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <div className="fl-stats">

        <div className="fl-stat-card">
          <div className="fl-stat-icon titles">
            <FaBook />
          </div>

          <div>
            <span>Titles</span>
            <strong>{books.length}</strong>
          </div>
        </div>

        <div className="fl-stat-card">
          <div className="fl-stat-icon copies">
            <FaBoxes />
          </div>

          <div>
            <span>Total Copies</span>
            <strong>{totalCopies}</strong>
          </div>
        </div>

        <div className="fl-stat-card">
          <div className="fl-stat-icon issued">
            <FaBookOpen />
          </div>

          <div>
            <span>Issued Out</span>
            <strong>
              {totalCopies - availableCopies}
            </strong>
          </div>
        </div>

        <div className="fl-stat-card">
          <div className="fl-stat-icon overdue">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Overdue</span>
            <strong>{overdueIssues.length}</strong>
          </div>
        </div>

        <div className="fl-stat-card">
          <div className="fl-stat-icon reserved">
            <FaBookmark />
          </div>

          <div>
            <span>Reservations</span>
            <strong>{reservations.length}</strong>
          </div>
        </div>

      </div>


      {/* ===================================================
          PENDING RESERVATIONS
      =================================================== */}

      {reservations.length > 0 && (
        <div className="fl-reservations">

          <h2>
            <FaBookmark />
            Pending Reservations
          </h2>

          <div className="fl-reservation-grid">

            {reservations.map((item) => {
              const book = books.find(
                (entry) =>
                  String(entry._id) ===
                  String(item.book?._id)
              );

              return (
                <div
                  className="fl-reservation-card"
                  key={item._id}
                >
                  <BookCover
                    title={
                      item.book?.title ||
                      item.bookTitle
                    }
                    author={item.book?.author || ""}
                    isbn={item.book?.isbn || ""}
                    coverUrl={item.book?.coverUrl}
                    size="sm"
                  />

                  <div className="fl-res-text">
                    <strong>
                      {item.book?.title ||
                        item.bookTitle}
                    </strong>

                    <span>
                      <FaUserGraduate />
                      {item.studentId}
                      {item.studentName
                        ? ` - ${item.studentName}`
                        : ""}
                    </span>

                    <small>
                      Requested{" "}
                      {formatDate(item.createdAt)}
                    </small>
                  </div>

                  <button
                    className="fl-fulfil-btn"
                    onClick={() =>
                      openIssueModal(book, item)
                    }
                    disabled={!book || !book.availableCopies}
                  >
                    <FaUserPlus />
                    Issue
                  </button>
                </div>
              );
            })}

          </div>
        </div>
      )}


      {/* ===================================================
          TABS
      =================================================== */}

      <div className="fl-tabs">

        <button
          className={
            tab === "catalogue" ? "active" : ""
          }
          onClick={() => setTab("catalogue")}
        >
          <FaBook />
          Catalogue
        </button>

        <button
          className={tab === "loans" ? "active" : ""}
          onClick={() => setTab("loans")}
        >
          <FaBookOpen />
          Issue &amp; Return
        </button>
      </div>


      {/* ===================================================
          CATALOGUE TAB
      =================================================== */}

      {tab === "catalogue" && (
        <>
          <div className="fl-controls">

            <div className="fl-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search by title, author or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="fl-filter">
              <FaLayerGroup />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div className="fl-table-wrap">
            <table className="fl-table">

              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredBooks.map((book) => (
                  <tr key={book._id}>

                    <td className="fl-book-title">

                      <BookCover
                        title={book.title}
                        author={book.author}
                        isbn={book.isbn}
                        coverUrl={book.coverUrl}
                        size="sm"
                      />

                      <div className="fl-book-text">
                        <strong>{book.title}</strong>

                        <small>
                          {book.isbn}
                          {book.shelf
                            ? ` - Shelf ${book.shelf}`
                            : ""}
                        </small>
                      </div>
                    </td>

                    <td>{book.author}</td>

                    <td>
                      <span className="fl-category">
                        {book.category}
                      </span>
                    </td>

                    <td>
                      <span className="fl-copies">
                        {book.availableCopies} /{" "}
                        {book.totalCopies}
                      </span>
                    </td>

                    <td>
                      {book.availableCopies > 0 ? (
                        <span className="fl-available">
                          <FaCheckCircle />
                          Available
                        </span>
                      ) : (
                        <span className="fl-issued">
                          <FaTimesCircle />
                          Issued
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="fl-actions">

                        <button
                          className="fl-issue-btn"
                          onClick={() => openIssueModal(book)}
                          disabled={!book.availableCopies}
                          title="Issue to student"
                        >
                          <FaUserPlus />
                          Issue
                        </button>

                        <button
                          className="fl-icon-btn"
                          onClick={() => openEditModal(book)}
                          title="Edit book"
                        >
                          <FaPencilAlt />
                        </button>

                        <button
                          className="fl-icon-btn danger"
                          onClick={() => handleDelete(book)}
                          title="Delete book"
                        >
                          <FaTrash />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}


                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="fl-empty">
                      <FaBook />
                      <span>No books found.</span>

                      <button
                        className="fl-inline-add"
                        onClick={openAddModal}
                      >
                        <FaPlus />
                        Add the first book
                      </button>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        </>
      )}


      {/* ===================================================
          ISSUE & RETURN TAB
      =================================================== */}

      {tab === "loans" && (
        <>

          <div className="fl-controls single">
            <div className="fl-filter wide">
              <FaLayerGroup />

              <select
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
              >
                <option value="issued">
                  Currently Issued
                </option>
                <option value="returned">
                  Returned
                </option>
                <option value="all">
                  All Records
                </option>
              </select>
            </div>
          </div>


          <div className="fl-table-wrap">
            <table className="fl-table">

              <thead>
                <tr>
                  <th>Book</th>
                  <th>Student</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredIssues.map((issue) => (
                  <tr key={issue._id}>

                    <td className="fl-book-title">

                      <BookCover
                        title={
                          issue.book?.title ||
                          issue.bookTitle
                        }
                        author={issue.book?.author || ""}
                        isbn={issue.book?.isbn || ""}
                        coverUrl={issue.book?.coverUrl}
                        size="sm"
                      />

                      <div className="fl-book-text">
                        <strong>
                          {issue.book?.title ||
                            issue.bookTitle}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <div className="fl-student">
                        <strong>
                          {issue.studentId}
                        </strong>

                        {issue.studentName && (
                          <small>
                            {issue.studentName}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      {formatDate(issue.issuedDate)}
                    </td>

                    <td>
                      {formatDate(issue.dueDate)}
                    </td>

                    <td>
                      {issue.fine > 0 ? (
                        <span className="fl-fine">
                          <FaRupeeSign />
                          {issue.fine}
                        </span>
                      ) : (
                        <span className="fl-none">-</span>
                      )}
                    </td>

                    <td>
                      {issue.status === "issued" ? (
                        issue.overdue ? (
                          <span className="fl-overdue">
                            <FaExclamationTriangle />
                            Overdue
                          </span>
                        ) : (
                          <span className="fl-available">
                            <FaCheckCircle />
                            Issued
                          </span>
                        )
                      ) : (
                        <span className="fl-returned">
                          <FaUndo />
                          Returned
                        </span>
                      )}
                    </td>

                    <td>
                      {issue.status === "issued" ? (
                        <button
                          className="fl-return-btn"
                          onClick={() => handleReturn(issue)}
                          disabled={saving}
                        >
                          <FaUndo />
                          Return
                        </button>
                      ) : (
                        <span className="fl-none">-</span>
                      )}
                    </td>

                  </tr>
                ))}


                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan="7" className="fl-empty">
                      <FaBookOpen />
                      <span>
                        No issue records found.
                      </span>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        </>
      )}


      {/* ===================================================
          ISSUE MODAL
      =================================================== */}

      {issueModal && (
        <div
          className="fl-overlay"
          onClick={() => setIssueModal(null)}
        >
          <div
            className="fl-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="fl-modal-close"
              onClick={() => setIssueModal(null)}
            >
              <FaTimes />
            </button>

            <div className="fl-modal-icon">
              <FaUserPlus />
            </div>

            <div className="fl-modal-cover">
              <BookCover
                title={issueModal.title}
                author={issueModal.author}
                isbn={issueModal.isbn}
                coverUrl={issueModal.coverUrl}
                size="lg"
              />
            </div>

            <h2>Issue Book</h2>

            <p className="fl-modal-sub">
              {issueModal.title}
            </p>

            <form onSubmit={handleIssue}>

              <div className="fl-field">
                <label>Student ID</label>

                <input
                  type="text"
                  placeholder="e.g. STU001"
                  value={issueForm.studentId}
                  onChange={(e) =>
                    setIssueForm((prev) => ({
                      ...prev,
                      studentId: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="fl-field">
                <label>Student Name</label>

                <input
                  type="text"
                  placeholder="Optional"
                  value={issueForm.studentName}
                  onChange={(e) =>
                    setIssueForm((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="fl-field">
                <label>Due Date</label>

                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) =>
                    setIssueForm((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="fl-modal-actions">
                <button
                  type="button"
                  className="fl-cancel-btn"
                  onClick={() => setIssueModal(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="fl-save-btn"
                  disabled={saving}
                >
                  <FaUserPlus />
                  {saving ? "Issuing..." : "Issue Book"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ===================================================
          ADD / EDIT BOOK MODAL
      =================================================== */}

      {bookModal && (
        <div
          className="fl-overlay"
          onClick={() => setBookModal(false)}
        >
          <div
            className="fl-modal wide"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="fl-modal-close"
              onClick={() => setBookModal(false)}
            >
              <FaTimes />
            </button>

            <div className="fl-modal-icon">
              <FaBook />
            </div>

            <h2>
              {editingBook
                ? "Edit Book"
                : "Add New Book"}
            </h2>

            <div className="fl-modal-cover">
              <BookCover
                title={bookForm.title}
                author={bookForm.author}
                isbn={bookForm.isbn}
                coverUrl={bookForm.coverUrl}
                size="lg"
              />
            </div>

            <form onSubmit={handleSaveBook}>

              <div className="fl-form-grid">

                <div className="fl-field span2">
                  <label>Title</label>

                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />

                  {bookErrors.title && (
                    <small className="fl-error">
                      {bookErrors.title}
                    </small>
                  )}
                </div>

                <div className="fl-field">
                  <label>Author</label>

                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                  />

                  {bookErrors.author && (
                    <small className="fl-error">
                      {bookErrors.author}
                    </small>
                  )}
                </div>

                <div className="fl-field">
                  <label>Category</label>

                  <input
                    type="text"
                    value={bookForm.category}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  />

                  {bookErrors.category && (
                    <small className="fl-error">
                      {bookErrors.category}
                    </small>
                  )}
                </div>

                <div className="fl-field">
                  <label>ISBN</label>

                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        isbn: e.target.value,
                      }))
                    }
                  />

                  {bookErrors.isbn && (
                    <small className="fl-error">
                      {bookErrors.isbn}
                    </small>
                  )}
                </div>

                <div className="fl-field">
                  <label>Publisher</label>

                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        publisher: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="fl-field">
                  <label>Shelf</label>

                  <input
                    type="text"
                    value={bookForm.shelf}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        shelf: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="fl-field">
                  <label>Total Copies</label>

                  <input
                    type="number"
                    min="1"
                    value={bookForm.totalCopies}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        totalCopies: e.target.value,
                      }))
                    }
                  />

                  {bookErrors.totalCopies && (
                    <small className="fl-error">
                      {bookErrors.totalCopies}
                    </small>
                  )}
                </div>

                <div className="fl-field">
                  <label>Fine per Day (₹)</label>

                  <input
                    type="number"
                    min="0"
                    value={bookForm.finePerDay}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        finePerDay: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="fl-field span2">
                  <label>
                    Cover Image URL (optional)
                  </label>

                  <input
                    type="url"
                    placeholder="https://... leave empty for a generated cover"
                    value={bookForm.coverUrl}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        coverUrl: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="fl-field span2">
                  <label>Description</label>

                  <textarea
                    rows="3"
                    value={bookForm.description}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

              </div>

              <div className="fl-modal-actions">
                <button
                  type="button"
                  className="fl-cancel-btn"
                  onClick={() => setBookModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="fl-save-btn"
                  disabled={saving}
                >
                  <FaCheckCircle />
                  {saving
                    ? "Saving..."
                    : editingBook
                    ? "Update Book"
                    : "Add Book"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyLibrary;
