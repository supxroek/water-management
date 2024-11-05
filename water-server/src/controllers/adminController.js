const bcrypt = require("bcrypt");
//const oracledb = require("oracledb");
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
  readAllUsers,
  deleteUser,
  updateUser,
};
