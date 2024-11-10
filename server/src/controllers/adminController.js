const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("../db");

// Create a new admin
const createAdmin = async (req, res) => {
  const { username, password, fullName, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await connectDB();

    await client.query(
      `INSERT INTO Admins (username, password, full_name, role) 
       VALUES ($1, $2, $3, $4)`,
      [username, hashedPassword, fullName, role]
    );

    res.status(201).json({ message: "Admin registered successfully" });
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering admin" });
  }
};

// Login an admin
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await connectDB();
    const result = await client.query(
      `SELECT * FROM Admins WHERE username = $1`,
      [username]
    );

    const admin = result.rows[0];
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // บันทึกการล็อกอินใน USERLOGS พร้อมบันทึก role
    await client.query(
      `INSERT INTO Userlogs (userlog_id, action, action_time, role)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`,
      [admin.admin_id, "Login", admin.role]
    );

    res.json({ token });
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in admin" });
  }
};

// Logout an admin
const logoutAdmin = async (req, res) => {
  const token = req.body.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const client = await connectDB();
    const result = await client.query(
      `SELECT * FROM Admins WHERE username = $1`,
      [username]
    );

    const admin = result.rows[0];

    // บันทึกการ logout ใน USERLOGS
    await client.query(
      `INSERT INTO Userlogs (userlog_id, action, action_time, role)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`,
      [admin.admin_id, "Logout", admin.role]
    );

    res.json({ message: "Admin logged out and log recorded successfully" });
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging out admin" });
  }
};

// Read a user count
const readUserCount = async (req, res) => {
  try {
    const client = await connectDB();
    const result = await client.query(`SELECT COUNT(*) FROM Users`);
    res.json(result.rows[0]);
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user count" });
  }
};

// read Userlogs
const readUserlogs = async (req, res) => {
  try {
    const client = await connectDB();
    const result = await client.query(`
      SELECT 
        Userlogs.log_id, 
        Userlogs.userlog_id, 
        COALESCE(Users.full_name, Admins.full_name) AS username, 
        Userlogs.action, 
        Userlogs.action_time, 
        COALESCE(Userlogs.role, Admins.role) AS role
      FROM Userlogs
      LEFT JOIN Users ON Userlogs.userlog_id = Users.user_id
      LEFT JOIN Admins ON Userlogs.userlog_id = Admins.admin_id
    `);

    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching userlogs" });
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  logoutAdmin,
  readUserlogs,
  readUserCount,
};
