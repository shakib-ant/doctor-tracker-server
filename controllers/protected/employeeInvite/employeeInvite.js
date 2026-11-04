import asyncHandler from "express-async-handler";
import { generateToken } from "#utils/helperFunction.js";
import EmployeeInvite from "#models/authModels/employeeInviteModel.js";
import Employee from "#models/authModels/employeeModel.js";

import jwt from "jsonwebtoken";
import { sendEmployeeInvitationEmail } from "#config/email/emailFormats/sendEmail.js";

const { verify } = jwt;


// invite employee
const inviteEmployee = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error("Please Enter an Email");
    }

    const emailExistsAsEmployee = await Employee.findOne({ email });

    if (emailExistsAsEmployee) {
        res.status(400);
        throw new Error(emailExistsAsEmployee?.email === email ? "Email already exist" : "Employee Id already exist");
    }

    const emailExistsinInvite = await EmployeeInvite.findOne({ email });

    if (emailExistsinInvite) {
        await emailExistsinInvite.remove();
    }

    const employeeInvite = await EmployeeInvite.create({
        email,
        employee: req.employee._id
    });

    if (employeeInvite) {
        if (req.employee.level === "superAdmin") {
            const token = generateToken(employeeInvite._id);

            //send mail
            const link = process.env.EMPLOYEE_APP_LINK + "auth/register/" + token;
            const subject = "Ant App Invite";
            const mainLineOne = "Congratulations";
            const mainLineTwo =
                "We’re excited to have you on Our App! This platform is designed to streamline your experience and keep everything in one place.";
            const textLine =
                "Click below to register and get started!. This link will be valid for next 24 hours.";
            const buttonText = "Register Now";

            await sendEmployeeInvitationEmail(
                employeeInvite.email,
                subject,
                mainLineOne,
                mainLineTwo,
                textLine,
                link,
                buttonText
            );
        }

        res.status(201).json({
            _id: employeeInvite.id,
            email: employeeInvite.email,
        });
    } else {
        res.status(400);
        throw new Error("Failed to create employee invite");
    }
});

// get all invites
const getSingleInvite = asyncHandler(async (req, res) => {

    const employeeInvite = await EmployeeInvite.findById(req.params.id);

    res.status(200).json(employeeInvite);
});

// get all invites
const getAllInvites = asyncHandler(async (req, res) => {
    const employeeInvites = await EmployeeInvite.find()
    res.status(200).json({
        employees: employeeInvites,
        totalEmployees: employeeInvites.length,
        totalPages : Math.ceil(employeeInvites.length / 15),
    });
});


// delete invite
const deleteInvite = asyncHandler(async (req, res) => {
    if (req.employee.level !== "admin" && req.employee.level !== "superAdmin") {
        res.status(400);
        throw new Error("You Must Be An Admin To Delete Invites!!");
    }

    const inviteToDelete = await EmployeeInvite.findById(req.params.id);

    if (!inviteToDelete) {
        res.status(400);
        throw new Error("Invite Not Found");
    }


    await EmployeeInvite.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Invite Deleted" });
});

// get email from token
const getEmailFromInviteToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const decoded = verify(token, process.env.JWT_SECRET);

    const invite = await EmployeeInvite.findOne({ _id: decoded.id });

    if (invite) {
        const { email, name, employeeImage } = invite;

        res.status(201).json({
            email,
            name,
            employeeImage: `https://${process.env.BUCKET}.sgp1.digitaloceanspaces.com/${employeeImage}`
        });
    } else {
        res.status(400);
        throw new Error("No Email Found with Token!!");
    }
});



const resendInvite = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employeeInvite = await EmployeeInvite.findById(id);

    if (!employeeInvite) {
        res.status(400);
        throw new Error("Invite Not Found");
    }

    const token = generateToken(employeeInvite._id);

    //send mail
    const link = process.env.EMPLOYEE_APP_LINK + "auth/register/" + token;
    const subject = "Ant App Invite";
    const mainLineOne = "Congratulations";
    const mainLineTwo =
        "We’re excited to have you on our App! This platform is designed to streamline your experience and keep everything in one place.";
    const textLine =
        "Click below to register and get started!. This link will be valid for next 24 hours.";
    const buttonText = "Register Now";

    await sendEmployeeInvitationEmail(
        employeeInvite.email,
        subject,
        mainLineOne,
        mainLineTwo,
        textLine,
        link,
        buttonText
    )

    res.status(201).json({
        _id: employeeInvite.id,
        email: employeeInvite.email,
    });
})

export {
    deleteInvite,
    getAllInvites,
    getEmailFromInviteToken,
    getSingleInvite,
    inviteEmployee,
    resendInvite
};
