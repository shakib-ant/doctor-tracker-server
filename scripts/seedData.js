import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import "../config/db.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js";
import Employee from "../models/authModels/employeeModel.js";

dotenv.config();

const doctorsData = [
  {
    name: "Dr. Emily Watson",
    specialization: "Cardiology",
    department: "Cardiovascular Medicine",
    designation: "Chief Cardiologist",
    hospital: "Mayo Clinic",
    experienceYears: 14,
    consultationFee: 180,
    phone: "+1 (507) 284-2511",
    email: "emily.watson@mayoclinic.org",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250",
    about: "Specializes in interventional cardiology, heart failure management, and preventive cardiovascular healthcare.",
    availableDays: ["Mon", "Wed", "Fri"],
    isActive: true,
  },
  {
    name: "Dr. James Miller",
    specialization: "Neurology",
    department: "Department of Neurology",
    designation: "Senior Neurologist",
    hospital: "Johns Hopkins Hospital",
    experienceYears: 18,
    consultationFee: 220,
    phone: "+1 (410) 955-5000",
    email: "james.miller@jhmi.edu",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250",
    about: "Expert in neurodegenerative disorders, stroke rehabilitation, and advanced epilepsy therapeutics.",
    availableDays: ["Tue", "Thu", "Sat"],
    isActive: true,
  },
  {
    name: "Dr. Sarah Mitchell",
    specialization: "Pediatrics",
    department: "Child Health Center",
    designation: "Pediatric Consultant",
    hospital: "Boston Children's Hospital",
    experienceYears: 11,
    consultationFee: 140,
    phone: "+1 (617) 355-6000",
    email: "sarah.mitchell@childrens.harvard.edu",
    image: "https://images.unsplash.com/photo-1594824813576-96b6fbcf2b44?auto=format&fit=crop&q=80&w=250",
    about: "Focuses on infant development, childhood asthma, and pediatric infectious diseases.",
    availableDays: ["Mon", "Tue", "Thu"],
    isActive: true,
  },
  {
    name: "Dr. Robert Davis",
    specialization: "Orthopedics",
    department: "Joint Reconstruction Unit",
    designation: "Orthopedic Surgeon",
    hospital: "Hospital for Special Surgery",
    experienceYears: 15,
    consultationFee: 195,
    phone: "+1 (212) 606-1000",
    email: "robert.davis@hss.edu",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250",
    about: "Specialized in minimally invasive knee and hip arthroplasty, and sports injury recovery.",
    availableDays: ["Wed", "Fri", "Sat"],
    isActive: true,
  },
  {
    name: "Dr. Jennifer Adams",
    specialization: "Dermatology",
    department: "Cutaneous Biology & Skin Care",
    designation: "Lead Dermatologist",
    hospital: "Cleveland Clinic",
    experienceYears: 9,
    consultationFee: 160,
    phone: "+1 (216) 444-2200",
    email: "jennifer.adams@ccf.org",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250",
    about: "Clinical dermatology expert focusing on complex inflammatory skin diseases and cosmetic rejuvenation.",
    availableDays: ["Mon", "Wed", "Thu"],
    isActive: true,
  },
  {
    name: "Dr. Michael Clark",
    specialization: "Internal Medicine",
    department: "Primary Health & Ambulatory Care",
    designation: "Attending Physician",
    hospital: "Massachusetts General Hospital",
    experienceYears: 12,
    consultationFee: 150,
    phone: "+1 (617) 726-2000",
    email: "michael.clark@mgh.harvard.edu",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250",
    about: "Specializes in chronic disease management, metabolic syndrome, and preventive adult healthcare.",
    availableDays: ["Mon", "Tue", "Wed", "Fri"],
    isActive: true,
  },
  {
    name: "Dr. Amanda White",
    specialization: "General Surgery",
    department: "Surgical Services Division",
    designation: "Consultant General Surgeon",
    hospital: "Stanford Health Care",
    experienceYears: 16,
    consultationFee: 250,
    phone: "+1 (650) 723-4000",
    email: "amanda.white@stanfordhealthcare.org",
    image: "https://images.unsplash.com/photo-1594824813576-96b6fbcf2b44?auto=format&fit=crop&q=80&w=250",
    about: "Specialized in laparoscopic abdominal procedures, endocrine surgery, and acute trauma interventions.",
    availableDays: ["Tue", "Fri"],
    isActive: true,
  },
  {
    name: "Dr. William Scott",
    specialization: "Oncology",
    department: "Hematologic Oncology Center",
    designation: "Senior Oncologist",
    hospital: "Memorial Sloan Kettering",
    experienceYears: 20,
    consultationFee: 230,
    phone: "+1 (212) 639-2000",
    email: "william.scott@mskcc.org",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250",
    about: "Renowned expert in precision cancer medicine, immunotherapy, and molecular oncology.",
    availableDays: ["Mon", "Wed"],
    isActive: true,
  },
  {
    name: "Dr. Jessica Taylor",
    specialization: "Gynecology",
    department: "Women's Reproductive Health",
    designation: "Senior Obstetrician",
    hospital: "Mount Sinai Hospital",
    experienceYears: 13,
    consultationFee: 175,
    phone: "+1 (212) 241-6500",
    email: "jessica.taylor@mountsinai.org",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250",
    about: "Dedicated to maternal-fetal medicine, high-risk obstetrics, and minimally invasive gynecologic surgery.",
    availableDays: ["Mon", "Thu", "Fri"],
    isActive: true,
  },
  {
    name: "Dr. Christopher Moore",
    specialization: "Psychiatry",
    department: "Behavioral Sciences & Mood Disorders",
    designation: "Clinical Psychiatrist",
    hospital: "UCSF Medical Center",
    experienceYears: 10,
    consultationFee: 165,
    phone: "+1 (415) 476-1000",
    email: "christopher.moore@ucsf.edu",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250",
    about: "Clinical psychiatrist specializing in adult mood disorders, treatment-resistant depression, and neurostimulation.",
    availableDays: ["Tue", "Wed", "Sat"],
    isActive: true,
  },
];

const patientSeeds = [
  { name: "Johnathan Hayes", age: 54, gender: "Male", condition: "Coronary Artery Disease", status: "Active", phone: "+1 (555) 234-8901", email: "jhayes@gmail.com", notes: "Post-angioplasty follow-up required in 3 weeks.", daysAgo: 2 },
  { name: "Eleanor Brooks", age: 67, gender: "Female", condition: "Hypertension", status: "Under Observation", phone: "+1 (555) 345-6789", email: "ebrooks@yahoo.com", notes: "Monitoring blood pressure medication dosage titration.", daysAgo: 5 },
  { name: "Liam Sullivan", age: 42, gender: "Male", condition: "Arrhythmia", status: "Active", phone: "+1 (555) 456-7890", email: "liam.s@outlook.com", notes: "Holter monitor scheduled for 48 hours continuous tracking.", daysAgo: 8 },
  { name: "Sophia Miller", age: 38, gender: "Female", condition: "Migraine", status: "Recovered", phone: "+1 (555) 567-8901", email: "smiller99@gmail.com", notes: "Prescribed preventative CGRP antagonist; symptoms cleared.", daysAgo: 12 },
  { name: "Oliver Vance", age: 61, gender: "Male", condition: "Parkinson's Disease", status: "Active", phone: "+1 (555) 678-9012", email: "ovance@gmail.com", notes: "Adjusted Carbidopa-Levodopa regimen.", daysAgo: 4 },
  { name: "Harper Davis", age: 7, gender: "Female", condition: "Pediatric Asthma", status: "Under Observation", phone: "+1 (555) 789-0123", email: "davis.parents@gmail.com", notes: "Inhaler technique reviewed with parents; peak flow stable.", daysAgo: 3 },
  { name: "Lucas Bennett", age: 10, gender: "Male", condition: "Seasonal Allergies", status: "Recovered", phone: "+1 (555) 890-1234", email: "bennett.family@gmail.com", notes: "Allergy testing complete; oral antihistamines provided.", daysAgo: 15 },
  { name: "Ava Thompson", age: 29, gender: "Female", condition: "Knee Ligament Strain", status: "Active", phone: "+1 (555) 901-2345", email: "ava.t@gmail.com", notes: "Grade II MCL sprain; enrolled in physical therapy twice weekly.", daysAgo: 6 },
  { name: "Benjamin Wright", age: 58, gender: "Male", condition: "Osteoarthritis", status: "Under Observation", phone: "+1 (555) 012-3456", email: "bwright@yahoo.com", notes: "Bilateral hip joint stiffness; scheduled for MRI.", daysAgo: 9 },
  { name: "Charlotte Foster", age: 34, gender: "Female", condition: "Severe Eczema", status: "Active", phone: "+1 (555) 123-4567", email: "cfoster@outlook.com", notes: "Started on Dupilumab biologic therapy.", daysAgo: 7 },
  { name: "Henry Richardson", age: 48, gender: "Male", condition: "Psoriasis", status: "Under Observation", phone: "+1 (555) 234-5678", email: "hrichardson@gmail.com", notes: "Topical corticosteroids prescribed with light therapy sessions.", daysAgo: 11 },
  { name: "Mia Patterson", age: 63, gender: "Female", condition: "Type 2 Diabetes", status: "Active", phone: "+1 (555) 345-6789", email: "mia.patterson@gmail.com", notes: "HbA1c checked at 7.4%; diet consultation scheduled.", daysAgo: 1 },
  { name: "Noah Jenkins", age: 50, gender: "Male", condition: "Dyslipidemia", status: "Recovered", phone: "+1 (555) 456-0123", email: "noah.jenkins@gmail.com", notes: "Lipid panel normalized after 3 months of Atorvastatin.", daysAgo: 20 },
  { name: "Emma Harrison", age: 45, gender: "Female", condition: "Gallstones (Cholelithiasis)", status: "Active", phone: "+1 (555) 567-1234", email: "eharrison@yahoo.com", notes: "Elective laparoscopic cholecystectomy planned next month.", daysAgo: 4 },
  { name: "William Clark", age: 71, gender: "Male", condition: "Inguinal Hernia", status: "Under Observation", phone: "+1 (555) 678-2345", email: "wclark@gmail.com", notes: "Pre-operative surgical clearance completed.", daysAgo: 14 },
  { name: "Abigail Ward", age: 56, gender: "Female", condition: "Breast Cancer (Stage I)", status: "Active", phone: "+1 (555) 789-3456", email: "award@gmail.com", notes: "Adjuvant chemotherapy cycle 2 initiated with good tolerance.", daysAgo: 10 },
  { name: "James Collins", age: 64, gender: "Male", condition: "Multiple Myeloma", status: "Critical", phone: "+1 (555) 890-4567", email: "jcollins@outlook.com", notes: "Under intensive targeted therapy; nephrology consult requested.", daysAgo: 18 },
  { name: "Evelyn Ross", age: 31, gender: "Female", condition: "Gestational Diabetes", status: "Active", phone: "+1 (555) 901-5678", email: "eross@gmail.com", notes: "28-week ultrasound normal; daily glucose monitoring instituted.", daysAgo: 3 },
  { name: "Daniel Reed", age: 39, gender: "Male", condition: "Major Depressive Disorder", status: "Active", phone: "+1 (555) 012-6789", email: "dreed@gmail.com", notes: "Initiated Escitalopram 10mg daily; cognitive behavioral therapy.", daysAgo: 13 },
  { name: "Grace Coleman", age: 26, gender: "Female", condition: "Generalized Anxiety Disorder", status: "Under Observation", phone: "+1 (555) 123-7890", email: "gcoleman@gmail.com", notes: "Symptom improvement noted; sleep hygiene regimen reinforced.", daysAgo: 16 },
];

export const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed default admin user
    const adminEmail = "admin@doctortracker.com";
    let admin = await Employee.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("Password@123", 10);
      admin = await Employee.create({
        name: "Healthcare Administrator",
        email: adminEmail,
        password: hashedPassword,
        level: "superAdmin",
        isActive: true,
      });
      console.log("Created admin user:", adminEmail);
    } else {
      console.log("Admin user already exists:", adminEmail);
    }

    // 2. Clear existing test doctors & patients
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    console.log("Cleared old doctor and patient records.");

    // 3. Insert USA Doctors
    const createdDoctors = await Doctor.insertMany(doctorsData);
    console.log(`Seeded ${createdDoctors.length} USA doctors.`);

    // 4. Insert Patients assigned across doctors
    const patientsToInsert = patientSeeds.map((seed, idx) => {
      const assignedDoctor = createdDoctors[idx % createdDoctors.length];
      const admissionDate = new Date();
      admissionDate.setDate(admissionDate.getDate() - seed.daysAgo);

      return {
        name: seed.name,
        age: seed.age,
        gender: seed.gender,
        condition: seed.condition,
        status: seed.status,
        phone: seed.phone,
        email: seed.email,
        notes: seed.notes,
        admissionDate,
        doctor: assignedDoctor._id,
      };
    });

    const createdPatients = await Patient.insertMany(patientsToInsert);
    console.log(`Seeded ${createdPatients.length} realistic patients.`);

    console.log("Seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

runSeed();
