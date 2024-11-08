const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const oracledb = require("oracledb");
const connectDB = require("../db");

// ยอดการใช้น้ำรวม
const getWaterUsage = async (req, res) => {
  try {
    const connection = await connectDB();
    const result = await connection.execute(
      `SELECT * FROM WaterUsage`,
      {},
      { outFormat: oracledb.OBJECT }
    );

    res.status(200).json(result.rows);
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching water usage" });
  }
};

module.exports = { getWaterUsage };
