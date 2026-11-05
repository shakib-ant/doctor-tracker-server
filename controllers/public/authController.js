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

    if (employee.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your access request is currently pending approval by the Super Administrator.",
      });
    }

    if (employee.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your access request was declined. Please contact the Super Administrator.",
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

export const requestAccess = async (req, res) => {
  try {
    const { name, email, password, department, requestNote } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, official email, and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already exists
    const existing = await Employee.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "An access request for this email is already pending approval.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newRequest = await Employee.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      level: "employee",
      status: "pending",
      isActive: false,
      department: department ? department.trim() : "General Clinical Administration",
      requestNote: requestNote ? requestNote.trim() : "",
      requestedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Access request submitted successfully. Awaiting Super Administrator approval.",
      request: {
        _id: newRequest._id,
        name: newRequest.name,
        email: newRequest.email,
        status: newRequest.status,
      },
    });
  } catch (error) {
    console.error("Access request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit access request",
    });
  }
};
