import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import Employee from "#models/authModels/employeeModel.js";

// @desc    Get all pending access requests
// @route   GET /api/employeeApp/protected/access/requests
// @access  Protected (SuperAdmin & Admin)
export const getAccessRequests = asyncHandler(async (req, res) => {
  const requests = await Employee.find({ status: "pending" })
    .select("-password")
    .sort({ requestedAt: -1, createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    requests: requests || [],
    total: (requests || []).length,
  });
});

// @desc    Approve access request and assign role (admin / employee)
// @route   PATCH /api/employeeApp/protected/access/approve/:id
// @access  Protected (SuperAdmin & Admin)
export const approveAccessRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role = "admin" } = req.body;

  const validRoles = ["superAdmin", "admin", "employee"];
  const targetRole = validRoles.includes(role) ? role : "admin";

  const employee = await Employee.findById(id);
  if (!employee) {
    res.status(404);
    throw new Error("Access request not found");
  }

  employee.status = "approved";
  employee.isActive = true;
  employee.level = targetRole;
  await employee.save();

  res.status(200).json({
    success: true,
    message: `User approved successfully as ${targetRole === "superAdmin" ? "Super Administrator" : targetRole === "admin" ? "Administrator" : "Staff Specialist"}.`,
    employee: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      level: employee.level,
      status: employee.status,
      isActive: employee.isActive,
      department: employee.department,
    },
  });
});

// @desc    Reject / delete an access request
// @route   DELETE /api/employeeApp/protected/access/reject/:id
// @access  Protected (SuperAdmin & Admin)
export const rejectAccessRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) {
    res.status(404);
    throw new Error("Access request not found");
  }

  await Employee.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Access request rejected and removed.",
  });
});

// @desc    Get all active admins and clinical staff
// @route   GET /api/employeeApp/protected/access/users
// @access  Protected (SuperAdmin & Admin)
export const getAllStaffUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const query = { status: { $ne: "pending" } };

  if (role && role !== "all") {
    query.level = role;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: new RegExp(escaped, "i") } },
      { email: { $regex: new RegExp(escaped, "i") } },
      { department: { $regex: new RegExp(escaped, "i") } },
    ];
  }

  const users = await Employee.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  // Always ensure default clinical superadmin is represented if not in DB
  const hasDefaultAdmin = users.some(
    (u) => u.email?.toLowerCase() === "admin@doctortracker.com"
  );

  const finalUsers = hasDefaultAdmin
    ? users
    : [
        {
          _id: "admin-default-id",
          name: "Clinical Admin (Primary)",
          email: "admin@doctortracker.com",
          level: "superAdmin",
          isActive: true,
          status: "approved",
          department: "Hospital Executive Board",
          createdAt: new Date().toISOString(),
          isPermanent: true,
        },
        ...users,
      ];

  res.status(200).json({
    success: true,
    users: finalUsers,
    total: finalUsers.length,
  });
});

// @desc    Update staff/admin role
// @route   PATCH /api/employeeApp/protected/access/role/:id
// @access  Protected (SuperAdmin only)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === "admin-default-id") {
    res.status(400);
    throw new Error("Primary Super Administrator role cannot be changed.");
  }

  const validRoles = ["superAdmin", "admin", "employee"];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role specified.");
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    res.status(404);
    throw new Error("Staff member not found.");
  }

  employee.level = role;
  await employee.save();

  res.status(200).json({
    success: true,
    message: `Role updated to ${role}.`,
    employee: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      level: employee.level,
    },
  });
});

// @desc    Toggle user active/suspended status
// @route   PATCH /api/employeeApp/protected/access/status/:id
// @access  Protected (SuperAdmin & Admin)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (id === "admin-default-id") {
    res.status(400);
    throw new Error("Primary Super Administrator cannot be deactivated.");
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    res.status(404);
    throw new Error("Staff member not found.");
  }

  employee.isActive = Boolean(isActive);
  await employee.save();

  res.status(200).json({
    success: true,
    message: `Account ${employee.isActive ? "activated" : "deactivated"} successfully.`,
    employee: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      isActive: employee.isActive,
    },
  });
});

// @desc    Directly add/invite a new administrator
// @route   POST /api/employeeApp/protected/access/invite
// @access  Protected (SuperAdmin & Admin)
export const directAddAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role = "admin", department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and initial password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();

  const existing = await Employee.findOne({ email: cleanEmail });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const validRoles = ["superAdmin", "admin", "employee"];
  const targetRole = validRoles.includes(role) ? role : "admin";

  const newAdmin = await Employee.create({
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    level: targetRole,
    status: "approved",
    isActive: true,
    department: department ? department.trim() : "Hospital Administration",
  });

  res.status(201).json({
    success: true,
    message: `Administrator ${newAdmin.name} registered successfully.`,
    employee: {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      level: newAdmin.level,
      status: newAdmin.status,
      isActive: newAdmin.isActive,
      department: newAdmin.department,
    },
  });
});

