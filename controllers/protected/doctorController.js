import mongoose from "mongoose";
import Doctor from "#models/doctorModel.js";
import { uploadObject, deleteObject } from "#config/space.js";

const escapeRegex = (string) => {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      qualifications,
      department,
      designation,
      hospital,
      experienceYears,
      consultationFee,
      about,
      availableDays,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Doctor name is required",
      });
    }

    if (!specialization || !specialization.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specialization is required",
      });
    }

    let imageUrl = "";

    if (req.files && req.files.image) {
      try {
        const file = req.files.image;
        const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
        const fileKey = `doctors/images/${Date.now()}-${sanitizedName}`;
        await uploadObject(fileKey, file.data, file.mimetype);
        imageUrl = fileKey;
      } catch (uploadErr) {
        console.error("Doctor image upload warning:", uploadErr.message);
      }
    }

    let parsedDays = [];
    if (availableDays) {
      if (Array.isArray(availableDays)) {
        parsedDays = availableDays;
      } else if (typeof availableDays === "string") {
        try {
          parsedDays = JSON.parse(availableDays);
        } catch {
          parsedDays = availableDays.split(",").map((d) => d.trim());
        }
      }
    }

    const doctor = await Doctor.create({
      name: name.trim(),
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      specialization: specialization.trim(),
      qualifications: qualifications ? qualifications.trim() : undefined,
      department: department ? department.trim() : undefined,
      designation: designation ? designation.trim() : undefined,
      hospital: hospital ? hospital.trim() : undefined,
      experienceYears:
        experienceYears !== undefined && experienceYears !== ""
          ? Number(experienceYears)
          : 0,
      consultationFee:
        consultationFee !== undefined && consultationFee !== ""
          ? Number(consultationFee)
          : 0,
      about: about ? about.trim() : undefined,
      image: imageUrl,
      availableDays: parsedDays,
      isActive: req.body.isActive === "false" ? false : true,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create doctor",
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      name,
      specialization,
      status,
      isActive,
      hospital,
      department,
    } = req.query;

    const query = {};

    if (isActive === "true" || status === "active") {
      query.isActive = true;
    } else if (isActive === "false" || status === "archived") {
      query.isActive = false;
    }

    const searchTerm = search || name;
    if (searchTerm && searchTerm.trim()) {
      const escaped = escapeRegex(searchTerm.trim());
      query.name = { $regex: escaped, $options: "i" };
    }

    if (specialization && specialization.trim()) {
      const escaped = escapeRegex(specialization.trim());
      query.specialization = { $regex: new RegExp(`^${escaped}$`, "i") };
    }

    if (hospital && hospital.trim()) {
      const escaped = escapeRegex(hospital.trim());
      query.hospital = { $regex: escaped, $options: "i" };
    }

    if (department && department.trim()) {
      const escaped = escapeRegex(department.trim());
      query.department = { $regex: escaped, $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Doctor.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDoctors / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
      totalDoctors,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      pagination: {
        total: totalDoctors,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all doctors error:", error.message);
    if (error.message?.includes("user is not allowed") || error.code === 13) {
      return res.status(200).json({
        success: true,
        message: "Atlas permissions restricted for collection. Returning empty list.",
        data: [],
        totalDoctors: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctors",
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const doctor = await Doctor.findById(id).lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctor",
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const existingDoctor = await Doctor.findById(id);

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const updateData = { ...req.body };

    if (updateData.name && !updateData.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Doctor name cannot be empty",
      });
    }

    if (updateData.specialization && !updateData.specialization.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specialization cannot be empty",
      });
    }

    if (req.files && req.files.image) {
      try {
        if (existingDoctor.image) {
          await deleteObject(existingDoctor.image);
        }
        const file = req.files.image;
        const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
        const fileKey = `doctors/images/${Date.now()}-${sanitizedName}`;
        await uploadObject(fileKey, file.data, file.mimetype);
        updateData.image = fileKey;
      } catch (uploadErr) {
        console.error("Doctor image update warning:", uploadErr.message);
      }
    }

    if (updateData.availableDays && typeof updateData.availableDays === "string") {
      try {
        updateData.availableDays = JSON.parse(updateData.availableDays);
      } catch {
        updateData.availableDays = updateData.availableDays
          .split(",")
          .map((d) => d.trim());
      }
    }

    if (updateData.experienceYears !== undefined) {
      updateData.experienceYears = Number(updateData.experienceYears) || 0;
    }

    if (updateData.consultationFee !== undefined) {
      updateData.consultationFee = Number(updateData.consultationFee) || 0;
    }

    if (updateData.isActive !== undefined) {
      updateData.isActive =
        updateData.isActive === true || updateData.isActive === "true";
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update doctor",
    });
  }
};

export const archiveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (req.body && req.body.isActive !== undefined) {
      doctor.isActive =
        req.body.isActive === true || req.body.isActive === "true";
    } else {
      doctor.isActive = !doctor.isActive;
    }

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: `Doctor ${doctor.isActive ? "activated" : "archived"} successfully`,
      data: doctor,
    });
  } catch (error) {
    console.error("Archive doctor error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to archive doctor",
    });
  }
};

