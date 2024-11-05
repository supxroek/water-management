const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protect all routes after this middleware
router.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: "User profile data", user: req.user });
});

router.get("/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
  res.json({ message: "Admin data" });
});

module.exports = router;
