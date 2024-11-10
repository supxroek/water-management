const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Routes
// Create a new admin
router.post("/register", adminController.createAdmin);

// Login an admin
router.post("/login", adminController.loginAdmin);

// Logout an admin
router.post("/logout", adminController.logoutAdmin);

// Read a user count
router.get(
  "/getUserCount",
  authenticateToken,
  authorizeRole("admin"),
  adminController.readUserCount
);

// Read userlogs
router.get(
  "/getUserlogs",
  authenticateToken,
  authorizeRole("admin"),
  adminController.readUserlogs
);

module.exports = router;
