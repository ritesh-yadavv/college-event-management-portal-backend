const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  getAllRegistrations,
  deleteRegistration,
  deleteStudent,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.get("/registrations", protect, adminOnly, getAllRegistrations);
router.delete("/registrations/:id", protect, adminOnly, deleteRegistration);

// optional student delete route
router.delete("/students/:id", protect, adminOnly, deleteStudent);

module.exports = router;