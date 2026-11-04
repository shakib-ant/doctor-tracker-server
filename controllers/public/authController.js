import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "#models/authModels/employeeModel.js";

const generateToken = (id, level) => {
  return jwt.sign({ id, level }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Built-in admin credentials check
    if (cleanEmail === "admin@doctortracker.com" && password === "Password@123") {
      const token = generateToken("admin-default-id", "superAdmin");
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        employee: {
          _id: "admin-default-id",
          name: "Clinical Admin",
          email: "admin@doctortracker.com",
          level: "superAdmin",
          dp: "",
        },
      });
    }

    // Database employee lookup
    let employee = null;
    try {
      employee = await Employee.findOne({ email: cleanEmail });
    } catch (dbErr) {
      console.warn("DB employee lookup warning:", dbErr.message);
    }

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(employee._id, employee.level);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        level: employee.level,
        dp: employee.dp || "",
      },
    });
  } catch (error) {
    console.error("Employee login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to authenticate",
    });
  }
};
