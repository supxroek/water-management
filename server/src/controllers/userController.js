const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const oracledb = require("oracledb");
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
    const connection = await connectDB();

    const result = await connection.execute(
      `INSERT INTO Users (full_name, house_number, id_card_number, password, phone_number, zone_id, role) 
            VALUES (:fullName, :houseNumber, :idCardNumber, :password, :phoneNumber, :zoneId, :role)`,
      {
        fullName,
        houseNumber,
        idCardNumber,
        password: hashedPassword,
        phoneNumber,
        zoneId,
        role,
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "User registered successfully" });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { idCardNumber, password } = req.body;

  try {
    const connection = await connectDB();
    const result = await connection.execute(
      `SELECT * FROM Users WHERE id_card_number = :idCardNumber`,
      { idCardNumber },
      { outFormat: oracledb.OBJECT }
    );

    const user = result.rows[0];
    const userLogId = user.USER_ID;
    const role = user.ROLE;

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userLogId: user.USER_ID, role: user.ROLE },
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
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
