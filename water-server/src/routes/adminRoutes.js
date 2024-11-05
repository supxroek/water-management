const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Routes
// Create a new admin
router.post(
  "/register",
  authenticateToken,
  authorizeRole("admin"),
  adminController.createAdmin
);

// Read all users
router.get(
  "/users",
  authenticateToken,
  authorizeRole("admin"),
  adminController.readAllUsers
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
