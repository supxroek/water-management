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

// Read all users
router.get(
  "/getUsers",
  authenticateToken,
  authorizeRole("admin"),
  adminController.readAllUsers
);

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

// Update a user
router.put(
  "/user/:userId",
  authenticateToken,
  authorizeRole("admin"),
  adminController.updateUser
);

// Delete a user
router.delete(
  "/user/:userId",
  authenticateToken,
  authorizeRole("admin"),
  adminController.deleteUser
);

module.exports = router;
