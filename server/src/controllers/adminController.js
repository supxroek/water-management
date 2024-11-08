const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const oracledb = require("oracledb");
const connectDB = require("../db");

// Create a new admin
const createAdmin = async (req, res) => {
  const { username, password, fullName, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await connectDB();

    const result = await connection.execute(
      `INSERT INTO Admins (username, password, full_name, role) 
            VALUES (:username, :password, :fullName, :role)`,
      { username, password: hashedPassword, fullName, role },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Admin registered successfully" });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering admin" });
  }
};

// Login an admin
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await connectDB();
    const result = await connection.execute(
      `SELECT * FROM Admins WHERE username = :username`,
      { username },
      { outFormat: oracledb.OBJECT }
    );

    const admin = result.rows[0];
    const userLogId = admin.ADMIN_ID;
    const role = admin.ROLE;

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.PASSWORD);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: admin.USERNAME, role: admin.ROLE },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // บันทึกการล็อกอินใน USERLOGS พร้อมบันทึก role
    await connection.execute(
      `INSERT INTO ADMIN.USERLOGS (USERLOG_ID, ACTION, ACTION_TIME, ROLE)
        VALUES (:userLogId, :action, CURRENT_TIMESTAMP, :role)`,
      {
        userLogId: userLogId,
        action: "Login",
        role: role,
      },
      {
        autoCommit: true,
      }
    );

    res.json({ token });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in admin" });
  }
};

// Logout an admin
const logoutAdmin = async (req, res) => {
  const token = req.body.token;

  try {
    // ตรวจสอบและ decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ใช้ Secret Key ของคุณที่ใช้ในการสร้าง Token
    const username = decoded.username;

    const connection = await connectDB();
    const result = await connection.execute(
      `SELECT * FROM Admins WHERE username = :username`,
      { username },
      { outFormat: oracledb.OBJECT }
    );

    const admin = result.rows[0];
    const userLogId = admin.ADMIN_ID;
    const role = admin.ROLE;

    // บันทึกการ logout ใน USERLOGS
    await connection.execute(
      `INSERT INTO ADMIN.USERLOGS (USERLOG_ID, ACTION, ACTION_TIME, ROLE)
        VALUES (:userLogId, :action, CURRENT_TIMESTAMP, :role)`,
      {
        userLogId: userLogId,
        action: "Logout",
        role: role,
      },
      {
        autoCommit: true,
      }
    );

    res.json({ message: "Admin logged out and log recorded successfully" });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging out admin" });
  }
};

// Read all users
const readAllUsers = async (req, res) => {
  try {
    const connection = await connectDB();
    const result = await connection.execute(`SELECT * FROM Users`);

    res.json(result.rows);
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Read a user count
const readUserCount = async (req, res) => {
  try {
    const connection = await connectDB();
    const result = await connection.execute(`SELECT COUNT(*) FROM Users`);

    res.json(result.rows[0]);
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user count" });
  }
};

// read Userlogs
const readUserlogs = async (req, res) => {
  try {
    const connection = await connectDB();
    const result = await connection.execute(`
      SELECT 
      Userlogs.LOG_ID, 
      Userlogs.USERLOG_ID, 
      COALESCE(USERS.FULL_NAME, ADMINS.FULL_NAME) AS username, 
      Userlogs.ACTION, 
      Userlogs.ACTION_TIME, 
      COALESCE(Userlogs.ROLE, ADMINS.ROLE) AS ROLE
      FROM Userlogs
      LEFT JOIN USERS ON Userlogs.USERLOG_ID = USERS.USER_ID
      LEFT JOIN ADMINS ON Userlogs.USERLOG_ID = ADMINS.ADMIN_ID
    `);

    res.json(result.rows);
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching userlogs" });
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, address, idCardNumber, password, phoneNumber, zone, role } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await connectDB();

    await connection.execute(
      `UPDATE Users 
               SET full_name = :fullName, address = :address, id_card_number = :idCardNumber, password = :password, phone_number = :phoneNumber, zone = :zone, role = :role
               WHERE user_id = :userId`,
      {
        fullName,
        address,
        idCardNumber,
        password: hashedPassword,
        phoneNumber,
        zone,
        role,
        userId,
      },
      { autoCommit: true }
    );

    res.json({ message: "User updated successfully" });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await connectDB();
    await connection.execute(
      `DELETE FROM Users WHERE user_id = :userId`,
      { userId },
      { autoCommit: true }
    );

    res.json({ message: "User deleted successfully" });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  logoutAdmin,
  readUserlogs,
  readAllUsers,
  readUserCount,
  deleteUser,
  updateUser,
};
