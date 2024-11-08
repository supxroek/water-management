const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Routes
// Register a new user
router.post("/register", userController.registerUser);

// Login a user
router.post("/login", userController.loginUser);

module.exports = router;
