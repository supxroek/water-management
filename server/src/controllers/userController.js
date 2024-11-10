const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("../db");

// Register a new user
const registerUser = async (req, res) => {
  const {
    fullName,
    houseNumber,
    idCardNumber,
    password,
    phoneNumber,
    zoneId,
    role,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await connectDB();

    await client.query(
      `INSERT INTO Users (full_name, house_number, id_card_number, password, phone_number, zone_id, role) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        fullName,
        houseNumber,
        idCardNumber,
        hashedPassword,
        phoneNumber,
        zoneId,
        role,
      ]
    );

    res.status(201).json({ message: "User registered successfully" });
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { idCardNumber, password } = req.body;

  try {
    const client = await connectDB();
    const result = await client.query(
      `SELECT * FROM Users WHERE id_card_number = $1`,
      [idCardNumber]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id_card_number: user.id_card_number, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // บันทึกการล็อกอินใน USERLOGS พร้อมบันทึก role
    await client.query(
      `INSERT INTO Userlogs (userlog_id, action, action_time, role)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`,
      [user.user_id, "Login", user.role]
    );

    res.json({ token });
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Logout a user
const logoutUser = async (req, res) => {
  const token = req.body.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const idCardNumber = decoded.id_card_number;

    const client = await connectDB();
    const result = await client.query(
      `SELECT * FROM Users WHERE id_card_number = $1`,
      [idCardNumber]
    );

    const user = result.rows[0];

    // บันทึกการล็อกอินใน USERLOGS พร้อมบันทึก role
    await client.query(
      `INSERT INTO Userlogs (userlog_id, action, action_time, role)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`,
      [user.user_id, "Logout", user.role]
    );

    res.json({ message: "User logged out successfully" });
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging out" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
