require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// helmet and morgan
const morgan = require("morgan");
const helmet = require("helmet");

// Routes
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// API Routes
// User routes
app.use("/api/users", userRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
