const express = require("express");

const {
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
} = require("../controllers/libraryController");

const router = express.Router();

const {
  verifyToken,
  isFacultyOrAdmin,
  ownsStudent,
} = require("../middleware/authMiddleware");

// =====================================================
// STATIC / NESTED ROUTES
// Must be registered before "/:id" so they are not
// swallowed by the single segment parameter route.
// =====================================================

router.get(
  "/categories",
  verifyToken,
  getCategories
);

router.get(
  "/issues/all",
  verifyToken,
  isFacultyOrAdmin,
  getIssues
);

router.get(
  "/issues/student/:studentId",
  verifyToken,
  ownsStudent("studentId"),
  getStudentIssues
);

router.get(
  "/reservations",
  verifyToken,
  getReservations
);

router.post(
  "/issue",
  verifyToken,
  isFacultyOrAdmin,
  issueBook
);

router.post(
  "/return",
  verifyToken,
  isFacultyOrAdmin,
  returnBook
);

router.post(
  "/reserve",
  verifyToken,
  reserveBook
);

router.delete(
  "/reserve/:bookId/student/:studentId",
  verifyToken,
  ownsStudent("studentId"),
  cancelReservation
);

// =====================================================
// BOOKS
// Any signed-in user can browse the catalogue.
// Faculty and admin manage the catalogue itself.
// =====================================================

router.get("/", verifyToken, getBooks);
router.get("/:id", verifyToken, getBookById);

router.post("/", verifyToken, isFacultyOrAdmin, createBook);
router.put("/:id", verifyToken, isFacultyOrAdmin, updateBook);
router.delete(
  "/:id",
  verifyToken,
  isFacultyOrAdmin,
  deleteBook
);

module.exports = router;
