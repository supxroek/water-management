const express = require("express");
const router = express.Router();
const waterUsageController = require("../controllers/waterUsageController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Routes
// ยอดน้ำที่ใช้ทั้งหมด
router.get(
  "/waterUsage",
  authenticateToken,
  authorizeRole("admin"),
  waterUsageController.getWaterUsage
);

module.exports = router;
