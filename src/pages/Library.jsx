import React, { useMemo, useState } from "react";
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
} from "react-icons/fa";
import "./Library.css";

const Library = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservedBooks, setReservedBooks] = useState([]);

  const [books] = useState([
    {
      id: 1,
      title: "Database Management System",
      author: "Raghu Ramakrishnan",
      category: "Database",
      isbn: "9780072465631",
      totalCopies: 5,
      availableCopies: 3,
      status: "Available",
      issuedDate: null,
      dueDate: null,
      fine: 0,
    },
    {
      id: 2,
      title: "Operating System Concepts",
      author: "Silberschatz",
      category: "Operating System",
      isbn: "9781119456339",
      totalCopies: 4,
      availableCopies: 0,
      status: "Issued",
      issuedDate: "18 Sep 2026",
      dueDate: "28 Sep 2026",
      fine: 0,
    },
    {
      id: 3,
      title: "Computer Networks",
      author: "Andrew Tanenbaum",
      category: "Networking",
      isbn: "9780132126953",
      totalCopies: 6,
      availableCopies: 4,
      status: "Available",
      issuedDate: null,
      dueDate: null,
      fine: 0,
    },
    {
      id: 4,
      title: "Java Programming",
      author: "Herbert Schildt",
      category: "Programming",
      isbn: "9781260440210",
      totalCopies: 5,
      availableCopies: 2,
      status: "Available",
      issuedDate: null,
      dueDate: null,
      fine: 0,
    },
    {
      id: 5,
      title: "Artificial Intelligence",
      author: "Stuart Russell",
      category: "Artificial Intelligence",
      isbn: "9780134610993",
      totalCopies: 3,
      availableCopies: 0,
      status: "Issued",
      issuedDate: "15 Sep 2026",
      dueDate: "25 Sep 2026",
      fine: 20,
    },
  ]);

  const categories = [
    "All",
    ...new Set(books.map((book) => book.category)),
  ];

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        book.title.toLowerCase().includes(searchText) ||
        book.author.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  const totalBooks = books.reduce(
    (total, book) => total + book.totalCopies,
    0
  );

  const availableBooks = books.reduce(
    (total, book) => total + book.availableCopies,
    0
  );

  const issuedBooks = totalBooks - availableBooks;

  const handleReserve = (bookId) => {
    if (reservedBooks.includes(bookId)) {
      return;
    }

    setReservedBooks((prev) => [...prev, bookId]);
  };

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
          SEARCH + FILTER
      ===================================================== */}

      <div className="library-controls">

        <div className="search-box">
          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search by book title or author..."
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

            {filteredBooks.map((book) => (

              <tr key={book.id}>

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
                    {book.availableCopies} / {book.totalCopies}
                  </span>
                </td>

                <td>

                  {book.status === "Available" ? (

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
                      onClick={() => setSelectedBook(book)}
                      title="View book details"
                    >
                      <FaEye />
                    </button>


                    {book.status === "Issued" && (

                      <button
                        className={
                          reservedBooks.includes(book.id)
                            ? "reserved-btn"
                            : "reserve-btn"
                        }
                        onClick={() => handleReserve(book.id)}
                        disabled={reservedBooks.includes(book.id)}
                        title="Reserve book"
                      >
                        <FaBookmark />

                        {reservedBooks.includes(book.id)
                          ? "Reserved"
                          : "Reserve"}
                      </button>

                    )}

                  </div>

                </td>

              </tr>

            ))}


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
                <strong>
                  {selectedBook.isbn}
                </strong>
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


              {selectedBook.issuedDate && (

                <div className="detail-item">
                  <span>
                    <FaCalendarAlt /> Issued Date
                  </span>

                  <strong>
                    {selectedBook.issuedDate}
                  </strong>
                </div>

              )}


              {selectedBook.dueDate && (

                <div className="detail-item">
                  <span>
                    <FaClock /> Due Date
                  </span>

                  <strong>
                    {selectedBook.dueDate}
                  </strong>
                </div>

              )}


              {selectedBook.fine > 0 && (

                <div className="detail-item fine-item">
                  <span>
                    <FaRupeeSign /> Fine
                  </span>

                  <strong>
                    ₹{selectedBook.fine}
                  </strong>
                </div>

              )}

            </div>


            {selectedBook.status === "Available" ? (

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