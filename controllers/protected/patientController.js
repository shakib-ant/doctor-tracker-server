import mongoose from "mongoose";
import Patient from "#models/patientModel.js";
import Doctor from "#models/doctorModel.js";

const escapeRegex = (string) => {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const createPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      email,
      condition,
      admissionDate,
      status,
      doctor,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient name is required",
      });
    }

    if (age === undefined || age === null || age === "") {
      return res.status(400).json({
        success: false,
        message: "Patient age is required",
      });
    }

    if (!condition || !condition.trim()) {
      return res.status(400).json({
        success: false,
        message: "Medical condition is required",
      });
    }

    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Assigned doctor ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Assigned doctor not found",
      });
    }

    const patient = await Patient.create({
      name: name.trim(),
      age: Number(age),
      gender: gender || "Male",
      phone: phone ? phone.trim() : "",
      email: email ? email.trim() : "",
      condition: condition.trim(),
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      status: status || "Active",
      doctor,
      notes: notes ? notes.trim() : "",
    });

    const populatedPatient = await Patient.findById(patient._id).populate(
      "doctor",
      "name specialization hospital email phone"
    );

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: populatedPatient,
    });
  } catch (error) {
    console.error("Create patient error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create patient",
    });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      condition,
      status,
      doctorId,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      query.doctor = doctorId;
    }

    if (condition && condition.trim() && condition !== "All") {
      const escaped = escapeRegex(condition.trim());
      query.condition = { $regex: new RegExp(`^${escaped}$`, "i") };
    }

    if (status && status.trim() && status !== "All") {
      query.status = status.trim();
    }

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { condition: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.admissionDate = {};
      if (startDate) {
        query.admissionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.admissionDate.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [patients, totalPatients] = await Promise.all([
      Patient.find(query)
        .populate("doctor", "name specialization hospital")
        .sort({ admissionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Patient.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPatients / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
      pagination: {
        total: totalPatients,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all patients error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve patients",
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
      });
    }

    const patient = await Patient.findById(id)
      .populate("doctor", "name specialization hospital phone email")
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Get patient by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve patient",
    });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
      });
    }

    const updateData = { ...req.body };

    if (updateData.age !== undefined) {
      updateData.age = Number(updateData.age);
    }

    if (updateData.doctor) {
      if (!mongoose.Types.ObjectId.isValid(updateData.doctor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID format",
        });
      }
      const docExists = await Doctor.findById(updateData.doctor);
      if (!docExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned doctor not found",
        });
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("doctor", "name specialization hospital");

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update patient",
    });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
      });
    }

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: { id: patient._id },
    });
  } catch (error) {
    console.error("Delete patient error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete patient",
    });
  }
};

export const getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const query = { doctor: doctorId };

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { condition: { $regex: escaped, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [patients, totalPatients] = await Promise.all([
      Patient.find(query)
        .sort({ admissionDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Patient.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPatients / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: "Doctor patients retrieved successfully",
      data: patients,
      pagination: {
        total: totalPatients,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get doctor patients error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctor patients",
    });
  }
};

