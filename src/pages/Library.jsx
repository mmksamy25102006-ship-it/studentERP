import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FaBook,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaLayerGroup,
  FaEye,
  FaTimes,
  FaBookmark,
  FaUserGraduate,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";

import API from "./../api";
import { formatDate } from "./../utils/format";

import "./Library.css";

// =====================================================
// FALLBACK DATA
// Used only while the library API is unavailable so the
// page still renders instead of showing an empty table.
// =====================================================

const FALLBACK_BOOKS = [
  {
    id: 1,
    title: "Database Management System",
    author: "Raghu Ramakrishnan",
    category: "Database",
    isbn: "9780072465631",
    publisher: "McGraw Hill",
    shelf: "A-1",
    totalCopies: 5,
    availableCopies: 3,
    finePerDay: 10,
    status: "Available",
  },
  {
    id: 2,
    title: "Operating System Concepts",
    author: "Silberschatz",
    category: "Operating System",
    isbn: "9781119456339",
    publisher: "Wiley",
    shelf: "A-2",
    totalCopies: 4,
    availableCopies: 0,
    finePerDay: 10,
    status: "Issued",
  },
  {
    id: 3,
    title: "Computer Networks",
    author: "Andrew Tanenbaum",
    category: "Networking",
    isbn: "9780132126953",
    publisher: "Pearson",
    shelf: "A-3",
    totalCopies: 6,
    availableCopies: 4,
    finePerDay: 10,
    status: "Available",
  },
  {
    id: 4,
    title: "Java Programming",
    author: "Herbert Schildt",
    category: "Programming",
    isbn: "9781260440210",
    publisher: "McGraw Hill",
    shelf: "A-4",
    totalCopies: 5,
    availableCopies: 2,
    finePerDay: 10,
    status: "Available",
  },
  {
    id: 5,
    title: "Artificial Intelligence",
    author: "Stuart Russell",
    category: "Artificial Intelligence",
    isbn: "9780134610993",
    publisher: "Pearson",
    shelf: "B-1",
    totalCopies: 3,
    availableCopies: 0,
    finePerDay: 20,
    status: "Issued",
  },
];

const FALLBACK_ISSUES = [
  {
    _id: "fallback-1",
    bookTitle: "Operating System Concepts",
    status: "issued",
    issuedDate: "2026-09-18T00:00:00.000Z",
    dueDate: "2026-09-28T00:00:00.000Z",
    fine: 0,
    overdue: false,
  },
  {
    _id: "fallback-2",
    bookTitle: "Artificial Intelligence",
    status: "issued",
    issuedDate: "2026-09-10T00:00:00.000Z",
    dueDate: "2026-09-20T00:00:00.000Z",
    fine: 20,
    overdue: true,
  },
];

// =====================================================
// HELPERS
// =====================================================

const getStudentId = () => {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    return (
      savedUser.studentId ||
      localStorage.getItem("studentId") ||
      ""
    );
  } catch {
    return localStorage.getItem("studentId") || "";
  }
};

const Library = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [message, setMessage] = useState("");

  const studentId = getStudentId();

  // ===================================================
  // LOAD BOOKS + STUDENT LOANS
  // ===================================================

  const loadLibrary = useCallback(async () => {
    try {
      const response = await API.get("/library");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.books || [];

      setBooks(data);
      setUsingFallback(false);
    } catch (error) {
      console.error("Library Books Error:", error);

      setBooks(FALLBACK_BOOKS);
      setUsingFallback(true);
    }

    if (!studentId) {
      setIssues([]);
      setReservations([]);
      setLoading(false);

      return;
    }

    try {
      const issuesResponse = await API.get(
        `/library/issues/student/${encodeURIComponent(
          studentId
        )}`
      );

      setIssues(issuesResponse.data?.issues || []);
    } catch (error) {
      console.error("Library Issues Error:", error);

      setIssues(FALLBACK_ISSUES);
    }

    try {
      const reservationsResponse = await API.get(
        `/library/reservations`,
        {
          params: { studentId },
        }
      );

      setReservations(
        reservationsResponse.data?.reservations || []
      );
    } catch (error) {
      console.error("Library Reservations Error:", error);

      setReservations([]);
    }

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Clear the notice after a short delay
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(""), 4000);

    return () => clearTimeout(timer);
  }, [message]);

  // ===================================================
  // FILTERS
  // ===================================================

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        books
          .map((book) => book.category)
          .filter(Boolean)
      ),
    ];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchText = search.toLowerCase().trim();

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

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalBooks = useMemo(() => {
    return books.reduce(
      (total, book) => total + (book.totalCopies || 0),
      0
    );
  }, [books]);

  const availableBooks = useMemo(() => {
    return books.reduce(
      (total, book) => total + (book.availableCopies || 0),
      0
    );
  }, [books]);

  const issuedBooks = totalBooks - availableBooks;

  // ===================================================
  // MY ISSUED BOOKS
  // ===================================================

  const myActiveIssues = useMemo(() => {
    return issues.filter((issue) => issue.status === "issued");
  }, [issues]);

  const myReturnedIssues = useMemo(() => {
    return issues.filter(
      (issue) => issue.status === "returned"
    );
  }, [issues]);

  const myPendingFines = useMemo(() => {
    return myActiveIssues.reduce(
      (total, issue) => total + (issue.fine || 0),
      0
    );
  }, [myActiveIssues]);

  const myOverdueCount = useMemo(() => {
    return myActiveIssues.filter(
      (issue) => issue.overdue
    ).length;
  }, [myActiveIssues]);

  const myPendingReservations = useMemo(() => {
    return reservations.filter(
      (item) => item.status === "pending"
    );
  }, [reservations]);

  const isReserved = (bookId) => {
    return reservations.some(
      (item) =>
        String(item.book?._id || item.book) ===
          String(bookId) &&
        item.status === "pending"
    );
  };

  // ===================================================
  // ACTIONS
  // ===================================================

  const handleReserve = async (book) => {
    if (isReserved(book._id || book.id)) {
      return;
    }

    try {
      const response = await API.post("/library/reserve", {
        bookId: book._id || book.id,
        studentId,
      });

      setReservations((prev) => [
        ...prev,
        response.data?.reservation,
      ]);

      setMessage(`"${book.title}" reserved successfully`);
    } catch (error) {
      console.error("Reserve Book Error:", error);

      // Offline / API not deployed yet
      setReservedBooks((prev) => [
        ...prev,
        book._id || book.id,
      ]);

      setMessage(
        error.response?.data?.message ||
          "Reserved for this session only"
      );
    }
  };

  const handleCancelReservation = async (book) => {
    const bookId = book._id || book.id;

    try {
      await API.delete(
        `/library/reserve/${encodeURIComponent(
          bookId
        )}/student/${encodeURIComponent(studentId)}`
      );

      setReservations((prev) =>
        prev.filter(
          (item) =>
            String(item.book?._id || item.book) !==
            String(bookId)
        )
      );

      setMessage(`Reservation for "${book.title}" cancelled`);
    } catch (error) {
      console.error("Cancel Reservation Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Could not cancel reservation"
      );
    }
  };

  const getBookTitle = (issue) => {
    return issue.book?.title || issue.bookTitle || "Unknown Book";
  };

  // ===================================================
  // RENDER
  // ===================================================

  if (loading) {
    return (
      <div className="library-page">
        <div className="library-status">
          <FaSyncAlt className="spin" />
          Loading library...
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="library-header">
        <h1>
          <FaBook />
          Library
        </h1>

        <p>
          Search, explore and manage your college library
        </p>
      </div>


      {message && (
        <div className="library-notice">
          <FaCheckCircle />
          {message}
        </div>
      )}


      {usingFallback && (
        <div className="library-notice warning">
          <FaExclamationTriangle />
          Library service is offline. Showing sample catalogue.
        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="library-stats">

        <div className="library-stat-card">
          <div className="stat-icon books-icon">
            <FaBook />
          </div>

          <div>
            <span>Total Books</span>
            <strong>{totalBooks}</strong>
          </div>
        </div>


        <div className="library-stat-card">
          <div className="stat-icon available-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Available</span>
            <strong>{availableBooks}</strong>
          </div>
        </div>


        <div className="library-stat-card">
          <div className="stat-icon issued-icon">
            <FaBookOpen />
          </div>

          <div>
            <span>Issued</span>
            <strong>{issuedBooks}</strong>
          </div>
        </div>


        <div className="library-stat-card">
          <div className="stat-icon category-icon">
            <FaLayerGroup />
          </div>

          <div>
            <span>Categories</span>
            <strong>{categories.length - 1}</strong>
          </div>
        </div>

      </div>


      {/* =====================================================
          MY ISSUED BOOKS
      ===================================================== */}

      <div className="my-books-section">

        <div className="my-books-header">
          <div className="my-books-title">
            <FaUserGraduate />

            <div>
              <h2>My Issued Books</h2>

              <p>
                Books currently with you
                {studentId ? ` (${studentId})` : ""}
              </p>
            </div>
          </div>


          <div className="my-books-summary">

            <span className="summary-chip">
              With me: {myActiveIssues.length}
            </span>

            <span className="summary-chip">
              Returned: {myReturnedIssues.length}
            </span>

            {myOverdueCount > 0 && (
              <span className="summary-chip overdue">
                <FaExclamationTriangle />
                Overdue: {myOverdueCount}
              </span>
            )}

            {myPendingFines > 0 && (
              <span className="summary-chip fine">
                <FaRupeeSign />
                Fine: {myPendingFines}
              </span>
            )}

          </div>
        </div>


        {myActiveIssues.length === 0 ? (
          <div className="my-books-empty">
            <FaCheckCircle />

            <span>You have no books issued right now.</span>
          </div>
        ) : (
          <div className="my-books-list">

            {myActiveIssues.map((issue) => (
              <div
                className={`my-book-card ${
                  issue.overdue ? "overdue" : ""
                }`}
                key={issue._id}
              >

                <div className="my-book-icon">
                  <FaBookOpen />
                </div>

                <div className="my-book-info">
                  <strong>{getBookTitle(issue)}</strong>

                  <span>
                    <FaCalendarAlt />
                    Issued {formatDate(issue.issuedDate)}
                  </span>

                  <span>
                    <FaClock />
                    Due {formatDate(issue.dueDate)}
                  </span>
                </div>

                <div className="my-book-status">

                  {issue.overdue ? (
                    <span className="overdue-badge">
                      <FaExclamationTriangle />
                      Overdue
                    </span>
                  ) : (
                    <span className="with-you-badge">
                      <FaCheckCircle />
                      With you
                    </span>
                  )}

                  {issue.fine > 0 && (
                    <span className="my-book-fine">
                      <FaRupeeSign />
                      {issue.fine}
                    </span>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}


        {myPendingReservations.length > 0 && (
          <div className="my-reservations">

            <h3>
              <FaBookmark />
              My Reservations
            </h3>

            {myPendingReservations.map((item) => {
              const bookId =
                item.book?._id || item.book;

              const book = books.find(
                (entry) =>
                  String(entry._id || entry.id) ===
                  String(bookId)
              );

              return (
                <div
                  className="my-reservation-row"
                  key={item._id}
                >
                  <span>
                    {item.book?.title ||
                      item.bookTitle ||
                      "Book"}
                  </span>

                  <span className="pending-badge">
                    Pending
                  </span>

                  {book && (
                    <button
                      className="cancel-reserve-btn"
                      onClick={() =>
                        handleCancelReservation(book)
                      }
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}

          </div>
        )}

      </div>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="library-controls">

        <div className="search-box">
          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search by book title, author or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


        <div className="category-filter">
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


      {/* =====================================================
          BOOK TABLE
      ===================================================== */}

      <div className="library-table">

        <table>

          <thead>
            <tr>
              <th>Book Name</th>
              <th>Author</th>
              <th>Category</th>
              <th>Copies</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>


          <tbody>

            {filteredBooks.map((book) => {
              const bookId = book._id || book.id;

              const reserved =
                isReserved(bookId) ||
                reservedBooks.includes(bookId);

              const available = book.availableCopies > 0;

              return (
                <tr key={bookId}>

                  <td className="book-title">
                    <FaBookOpen />
                    {book.title}
                  </td>

                  <td>{book.author}</td>

                  <td>
                    <span className="category-badge">
                      {book.category}
                    </span>
                  </td>

                  <td>
                    <span className="copies-count">
                      {book.availableCopies} /{" "}
                      {book.totalCopies}
                    </span>
                  </td>

                  <td>

                    {available ? (

                      <span className="available">
                        <FaCheckCircle />
                        Available
                      </span>

                    ) : (

                      <span className="issued">
                        <FaTimesCircle />
                        Issued
                      </span>

                    )}

                  </td>


                  <td>

                    <div className="book-actions">

                      <button
                        className="library-view-btn"
                        onClick={() =>
                          setSelectedBook(book)
                        }
                        title="View book details"
                      >
                        <FaEye />
                      </button>

                      {!available && studentId && (

                        <button
                          className={
                            reserved
                              ? "reserved-btn"
                              : "reserve-btn"
                          }
                          onClick={() =>
                            reserved
                              ? handleCancelReservation(book)
                              : handleReserve(book)
                          }
                          title={
                            reserved
                              ? "Cancel reservation"
                              : "Reserve book"
                          }
                        >
                          {reserved ? (
                            <>
                              <FaTimes />
                              Reserved
                            </>
                          ) : (
                            <>
                              <FaBookmark />
                              Reserve
                            </>
                          )}
                        </button>

                      )}

                    </div>

                  </td>

                </tr>
              );
            })}


            {filteredBooks.length === 0 && (

              <tr>

                <td
                  colSpan="6"
                  className="no-books"
                >
                  <FaBook />
                  <span>No books found.</span>
                  <small>
                    Try another search or category.
                  </small>
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          BOOK DETAILS MODAL
      ===================================================== */}

      {selectedBook && (

        <div
          className="book-modal-overlay"
          onClick={() => setSelectedBook(null)}
        >

          <div
            className="book-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setSelectedBook(null)}
            >
              <FaTimes />
            </button>


            <div className="modal-book-icon">
              <FaBookOpen />
            </div>


            <h2>{selectedBook.title}</h2>

            <p className="modal-author">
              by {selectedBook.author}
            </p>


            <div className="book-details">

              <div className="detail-item">
                <span>Category</span>
                <strong>
                  {selectedBook.category}
                </strong>
              </div>


              <div className="detail-item">
                <span>ISBN</span>
                <strong>{selectedBook.isbn}</strong>
              </div>


              <div className="detail-item">
                <span>Total Copies</span>
                <strong>
                  {selectedBook.totalCopies}
                </strong>
              </div>


              <div className="detail-item">
                <span>Available Copies</span>
                <strong>
                  {selectedBook.availableCopies}
                </strong>
              </div>


              {selectedBook.publisher && (
                <div className="detail-item">
                  <span>Publisher</span>
                  <strong>
                    {selectedBook.publisher}
                  </strong>
                </div>
              )}


              {selectedBook.shelf && (
                <div className="detail-item">
                  <span>Shelf</span>
                  <strong>
                    {selectedBook.shelf}
                  </strong>
                </div>
              )}


              {selectedBook.finePerDay > 0 && (
                <div className="detail-item fine-item">
                  <span>
                    <FaRupeeSign /> Fine / Day
                  </span>

                  <strong>
                    ₹{selectedBook.finePerDay}
                  </strong>
                </div>
              )}

            </div>


            {selectedBook.availableCopies > 0 ? (

              <div className="modal-status available-modal">
                <FaCheckCircle />
                Book is currently available
              </div>

            ) : (

              <div className="modal-status issued-modal">
                <FaTimesCircle />
                All copies are currently issued
              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default Library;
