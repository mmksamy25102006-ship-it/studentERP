import React, { useState } from "react";
import {
  FaBook,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./Library.css";

const Library = () => {
  const [search, setSearch] = useState("");

  const [books] = useState([
    {
      id: 1,
      title: "Database Management System",
      author: "Raghu Ramakrishnan",
      status: "Available",
    },
    {
      id: 2,
      title: "Operating System Concepts",
      author: "Silberschatz",
      status: "Issued",
    },
    {
      id: 3,
      title: "Computer Networks",
      author: "Andrew Tanenbaum",
      status: "Available",
    },
    {
      id: 4,
      title: "Java Programming",
      author: "Herbert Schildt",
      status: "Available",
    },
    {
      id: 5,
      title: "Artificial Intelligence",
      author: "Stuart Russell",
      status: "Issued",
    },
  ]);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>
          <FaBook /> Library
        </h1>
        <p>Search and manage library books</p>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="library-table">
        <table>
          <thead>
            <tr>
              <th>Book Name</th>
              <th>Author</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>

                <td>{book.author}</td>

                <td>
                  {book.status === "Available" ? (
                    <span className="available">
                      <FaCheckCircle /> Available
                    </span>
                  ) : (
                    <span className="issued">
                      <FaTimesCircle /> Issued
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan="3" className="no-books">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Library;
