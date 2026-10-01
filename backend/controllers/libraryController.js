// backend/controllers/libraryController.js

const Book = require("../models/Book");
const BookIssue = require("../models/BookIssue");
const BookReservation = require("../models/BookReservation");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Calculate fine for an issue that is still with the student
const calculateFine = (issue, book) => {
  if (issue.status === "returned" || !issue.dueDate) {
    return issue.fine || 0;
  }

  const finePerDay = Number(book?.finePerDay) || 0;

  if (finePerDay <= 0) {
    return issue.fine || 0;
  }

  const overdueDays = Math.ceil(
    (Date.now() - new Date(issue.dueDate)) / DAY_IN_MS
  );

  return overdueDays > 0 ? overdueDays * finePerDay : 0;
};

// Attach live fine + overdue flag to an issue
const withFineDetails = (issue, book) => {
  const fine = calculateFine(issue, book);

  const overdue =
    issue.status === "issued" &&
    !!issue.dueDate &&
    new Date(issue.dueDate) < new Date();

  return {
    ...issue.toObject(),
    fine,
    overdue,
    finePerDay: book?.finePerDay || 0,
  };
};

// GET ALL BOOKS
const getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      const escaped = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: new RegExp(escaped, "i") },
        { author: new RegExp(escaped, "i") },
        { isbn: new RegExp(escaped, "i") },
      ];
    }

    const books = await Book.find(filter).sort({
      title: 1,
    });

    res.status(200).json({
      success: true,
      books,
    });
  } catch (error) {
    console.error("Get Books Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

// GET BOOK CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct("category");

    res.status(200).json({
      success: true,
      categories: categories.sort(),
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// GET SINGLE BOOK
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Get Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

// CREATE BOOK
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      publisher,
      shelf,
      totalCopies,
      finePerDay,
      description,
    } = req.body;

    if (!title || !author || !category || !isbn) {
      return res.status(400).json({
        success: false,
        message:
          "Title, author, category and ISBN are required",
      });
    }

    const copies = Number(totalCopies);

    if (!Number.isFinite(copies) || copies < 1) {
      return res.status(400).json({
        success: false,
        message: "Total copies must be at least 1",
      });
    }

    const existing = await Book.findOne({
      isbn: String(isbn).trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: String(isbn).trim(),
      publisher: publisher || "",
      shelf: shelf || "",
      totalCopies: copies,
      availableCopies: copies,
      finePerDay: Number(finePerDay) || 0,
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    console.error("Create Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add book",
      error: error.message,
    });
  }
};

// UPDATE BOOK
const updateBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      publisher,
      shelf,
      totalCopies,
      finePerDay,
      description,
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const activeIssues = await BookIssue.countDocuments({
      book: book._id,
      status: "issued",
    });

    if (title !== undefined) book.title = title.trim();

    if (author !== undefined) book.author = author.trim();

    if (category !== undefined) {
      book.category = category.trim();
    }

    if (isbn !== undefined && isbn.trim() !== book.isbn) {
      const duplicate = await Book.findOne({
        isbn: String(isbn).trim(),
        _id: { $ne: book._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A book with this ISBN already exists",
        });
      }

      book.isbn = String(isbn).trim();
    }

    if (publisher !== undefined) {
      book.publisher = publisher;
    }

    if (shelf !== undefined) {
      book.shelf = shelf;
    }

    if (description !== undefined) {
      book.description = description;
    }

    if (finePerDay !== undefined) {
      book.finePerDay = Number(finePerDay) || 0;
    }

    if (totalCopies !== undefined) {
      const copies = Number(totalCopies);

      if (!Number.isFinite(copies) || copies < 1) {
        return res.status(400).json({
          success: false,
          message: "Total copies must be at least 1",
        });
      }

      if (copies < activeIssues) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce copies below ${activeIssues} currently issued`,
        });
      }

      book.totalCopies = copies;
      book.availableCopies = copies - activeIssues;
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Update Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const activeIssues = await BookIssue.countDocuments({
      book: book._id,
      status: "issued",
    });

    if (activeIssues > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a book that is currently issued to students",
      });
    }

    await BookIssue.deleteMany({ book: book._id });
    await BookReservation.deleteMany({ book: book._id });
    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

// ISSUE BOOK TO A STUDENT
const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, studentName, dueDate, facultyId } =
      req.body;

    if (!bookId || !studentId || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Book, student ID and due date are required",
      });
    }

    const cleanStudentId = String(studentId).trim().toUpperCase();

    const existing = await BookIssue.findOne({
      studentId: cleanStudentId,
      status: "issued",
      book: bookId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This student already has this book issued",
      });
    }

    // Atomic decrement so two requests cannot over-issue a copy
    const book = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableCopies: { $gt: 0 },
      },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!book) {
      const exists = await Book.findById(bookId);

      return res.status(400).json({
        success: false,
        message: exists
          ? "No copies of this book are available"
          : "Book not found",
      });
    }

    const issue = await BookIssue.create({
      book: book._id,
      bookTitle: book.title,
      studentId: cleanStudentId,
      studentName: studentName || "",
      issuedDate: new Date(),
      dueDate: new Date(dueDate),
      status: "issued",
      issuedBy: facultyId || "",
    });

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      issue: withFineDetails(issue, book),
      book,
    });
  } catch (error) {
    console.error("Issue Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to issue book",
      error: error.message,
    });
  }
};

// RETURN A BOOK
const returnBook = async (req, res) => {
  try {
    const { issueId } = req.body;

    const issue = await BookIssue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue record not found",
      });
    }

    if (issue.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "This book has already been returned",
      });
    }

    const book = await Book.findById(issue.book);

    const returnedDate = new Date();

    const fine = calculateFine(issue, book);

    issue.status = "returned";
    issue.returnedDate = returnedDate;
    issue.fine = fine;

    await issue.save();

    if (book) {
      await Book.findByIdAndUpdate(issue.book, {
        $inc: { availableCopies: 1 },
      });
    }

    // Auto fulfil the oldest pending reservation
    const reservation = await BookReservation.findOne({
      book: issue.book,
      status: "pending",
    }).sort({ createdAt: 1 });

    if (reservation) {
      reservation.status = "fulfilled";

      await reservation.save();
    }

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      issue: withFineDetails(issue, book),
      fine,
    });
  } catch (error) {
    console.error("Return Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to return book",
      error: error.message,
    });
  }
};

// GET ALL ISSUES (FACULTY)
const getIssues = async (req, res) => {
  try {
    const { status, limit } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const issues = await BookIssue.find(filter)
      .populate("book", "title author category isbn")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    const results = issues.map((issue) => {
      const plain = issue.toObject();

      return {
        ...plain,
        fine: calculateFine(issue, plain.book),
        overdue:
          issue.status === "issued" &&
          !!issue.dueDate &&
          new Date(issue.dueDate) < new Date(),
      };
    });

    res.status(200).json({
      success: true,
      issues: results,
    });
  } catch (error) {
    console.error("Get Issues Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};

// GET BOOKS ISSUED TO A STUDENT
const getStudentIssues = async (req, res) => {
  try {
    const studentId = String(req.params.studentId)
      .trim()
      .toUpperCase();

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const issues = await BookIssue.find({ studentId })
      .populate("book", "title author category isbn")
      .sort({ issuedDate: -1 });

    const results = issues.map((issue) => {
      const plain = issue.toObject();

      return {
        ...plain,
        fine: calculateFine(issue, plain.book),
        overdue:
          issue.status === "issued" &&
          !!issue.dueDate &&
          new Date(issue.dueDate) < new Date(),
      };
    });

    res.status(200).json({
      success: true,
      issues: results,
    });
  } catch (error) {
    console.error("Get Student Issues Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student issues",
      error: error.message,
    });
  }
};

// RESERVE A BOOK
const reserveBook = async (req, res) => {
  try {
    const { bookId, studentId, studentName } = req.body;

    if (!bookId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Book and student ID are required",
      });
    }

    const cleanStudentId = String(studentId)
      .trim()
      .toUpperCase();

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const alreadyIssued = await BookIssue.findOne({
      book: bookId,
      studentId: cleanStudentId,
      status: "issued",
    });

    if (alreadyIssued) {
      return res.status(409).json({
        success: false,
        message: "You already have this book issued",
      });
    }

    const existing = await BookReservation.findOne({
      book: bookId,
      studentId: cleanStudentId,
      status: "pending",
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reserved this book",
      });
    }

    const reservation = await BookReservation.create({
      book: book._id,
      bookTitle: book.title,
      studentId: cleanStudentId,
      studentName: studentName || "",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Book reserved successfully",
      reservation,
    });
  } catch (error) {
    console.error("Reserve Book Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reserve book",
      error: error.message,
    });
  }
};

// CANCEL A RESERVATION
const cancelReservation = async (req, res) => {
  try {
    const { bookId, studentId } = req.params;

    const reservation = await BookReservation.findOneAndUpdate(
      {
        book: bookId,
        studentId: String(studentId).trim().toUpperCase(),
        status: "pending",
      },
      { status: "cancelled" },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "No pending reservation found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation cancelled",
      reservation,
    });
  } catch (error) {
    console.error("Cancel Reservation Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel reservation",
      error: error.message,
    });
  }
};

// GET RESERVATIONS
const getReservations = async (req, res) => {
  try {
    const { status, studentId } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (studentId) {
      filter.studentId = String(studentId)
        .trim()
        .toUpperCase();
    }

    const reservations = await BookReservation.find(filter)
      .populate("book", "title author category isbn")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error("Get Reservations Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
      error: error.message,
    });
  }
};

module.exports = {
  getBooks,
  getCategories,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getIssues,
  getStudentIssues,
  reserveBook,
  cancelReservation,
  getReservations,
};
