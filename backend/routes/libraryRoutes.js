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

// =====================================================
// STATIC / NESTED ROUTES
// Must be registered before "/:id" so they are not
// swallowed by the single segment parameter route.
// =====================================================

router.get("/categories", getCategories);
router.get("/issues/all", getIssues);
router.get("/issues/student/:studentId", getStudentIssues);
router.get("/reservations", getReservations);

router.post("/issue", issueBook);
router.post("/return", returnBook);
router.post("/reserve", reserveBook);

router.delete(
  "/reserve/:bookId/student/:studentId",
  cancelReservation
);

// =====================================================
// BOOKS
// =====================================================

router.get("/", getBooks);
router.get("/:id", getBookById);

router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;
