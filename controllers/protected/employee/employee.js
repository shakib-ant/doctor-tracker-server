import asyncHandler from "express-async-handler";
import Employee from "#models/authModels/employeeModel.js";

// Get all employees
const getAllEmployees = asyncHandler(async (req, res) => {
    const { search, filter, limit = 10, page = 1 } = req.query;
    const query = {};

    if (filter === "active") {
        query.isActive = true;
    } else if (filter === "archived") {
        query.isActive = false;
    }

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
            { name: { $regex: new RegExp(escapedSearch, "i") } },
            { email: { $regex: new RegExp(escapedSearch, "i") } },
            { employeeId: { $regex: new RegExp(escapedSearch, "i") } },
            { nickName: { $regex: new RegExp(escapedSearch, "i") } },
        ];
    }

    const employees = await Employee.find(query)
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean()
        .exec();


    const totalEmployees = await Employee.countDocuments(query);

    res.status(200).json({
        employees,
        totalPages: Math.ceil(totalEmployees / limit),
        totalEmployees,
        currentPage: parseInt(page),
    });


});

const archiveEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
        res.status(400);
        throw new Error("Employee Not Found");
    }

    await employee.updateOne({ isActive: req.body.isActive });

    res.status(200).json({ message: "Employee Archived" });
});

export {
    getAllEmployees,
    archiveEmployee
};
