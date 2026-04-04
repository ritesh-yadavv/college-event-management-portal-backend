const express = require("express");
const router = express.Router();

const {
  registerForEvent,
  cancelRegistrationByAdmin,
  getMyRegistrations,
  getAllRegistrationsForAdmin
} = require("../controllers/registrationController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, registerForEvent);
router.get("/my/all", protect, getMyRegistrations);

router.get("/admin/all", protect, adminOnly, getAllRegistrationsForAdmin);
router.delete("/admin/:registrationId", protect, adminOnly, cancelRegistrationByAdmin);

module.exports = router;