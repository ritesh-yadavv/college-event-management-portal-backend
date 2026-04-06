const express = require("express");
const router = express.Router();

const {
  getAllEvents,
  getSingleEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getSingleEvent);

// Admin routes
router.post("/", protect, adminOnly, upload.single("image"), createEvent);
router.put("/:id", protect, adminOnly, upload.single("image"), updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;