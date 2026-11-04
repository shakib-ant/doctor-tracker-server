import Doctor from "#models/doctorModel.js";
import Patient from "#models/patientModel.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalDoctors,
      activeDoctors,
      totalPatients,
      activePatients,
      patientsPerDoctor,
      dateBasedStats,
      conditionDistribution,
      statusDistribution,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ isActive: true }),
      Patient.countDocuments(),
      Patient.countDocuments({ status: "Active" }),

      // Patients per doctor aggregation
      Patient.aggregate([
        { $match: { docType: "patient" } },
        {
          $group: {
            _id: "$doctor",
            patientCount: { $sum: 1 },
          },
        },
        { $sort: { patientCount: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: "Empty",
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        {
          $project: {
            _id: 0,
            doctorId: "$doctor._id",
            name: "$doctor.name",
            specialization: "$doctor.specialization",
            hospital: "$doctor.hospital",
            patientCount: 1,
          },
        },
      ]),

      // Date-based admissions over the last 30 days
      Patient.aggregate([
        {
          $match: {
            docType: "patient",
            admissionDate: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            count: 1,
          },
        },
      ]),

      // Top medical conditions distribution
      Patient.aggregate([
        { $match: { docType: "patient" } },
        {
          $group: {
            _id: "$condition",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 0,
            condition: "$_id",
            count: 1,
          },
        },
      ]),

      // Patient status distribution
      Patient.aggregate([
        { $match: { docType: "patient" } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]),
    ]);

    const averagePatientsPerDoctor =
      totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      message: "Dashboard analytics retrieved successfully",
      data: {
        summary: {
          totalDoctors,
          activeDoctors,
          totalPatients,
          activePatients,
          averagePatientsPerDoctor: Number(averagePatientsPerDoctor),
        },
        patientsPerDoctor,
        dateBasedStats,
        conditionDistribution,
        statusDistribution,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error.message);
    if (error.message?.includes("user is not allowed") || error.code === 13) {
      return res.status(200).json({
        success: true,
        message: "Database permissions restricted. Defaulting metrics to 0.",
        data: {
          summary: {
            totalDoctors: 0,
            activeDoctors: 0,
            totalPatients: 0,
            activePatients: 0,
            averagePatientsPerDoctor: 0,
          },
          patientsPerDoctor: [],
          dateBasedStats: [],
          conditionDistribution: [],
          statusDistribution: [],
        },
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard analytics",
    });
  }
};

