import '../config/db.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Doctor from '../models/doctorModel.js';
import Patient from '../models/patientModel.js';
import Employee from '../models/authModels/employeeModel.js';

dotenv.config();

const FIRST_NAMES_MALE = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
  "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
  "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian",
  "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Ryan", "Jacob",
  "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott",
  "Brandon", "Benjamin", "Samuel", "Gregory", "Alexander", "Frank", "Patrick", "Raymond", "Jack"
];

const FIRST_NAMES_FEMALE = [
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica",
  "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley",
  "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda", "Dorothy", "Melissa",
  "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen", "Amy",
  "Angela", "Shirley", "Anna", "Brenda", "Pamela", "Emma", "Nicole", "Helen",
  "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Carolyn", "Janet", "Maria"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker"
];

const SPECIALTIES = [
  { name: "Cardiology", dept: "Cardiovascular Medicine", hospital: "Mayo Clinic" },
  { name: "Neurology", dept: "Neurosciences", hospital: "Johns Hopkins Hospital" },
  { name: "Pediatrics", dept: "Child Health", hospital: "Boston Children's Hospital" },
  { name: "Orthopedics", dept: "Orthopedic Surgery", hospital: "Hospital for Special Surgery" },
  { name: "Dermatology", dept: "Dermatology & Skin Biology", hospital: "NYU Langone Health" },
  { name: "Oncology", dept: "Medical Oncology", hospital: "Memorial Sloan Kettering" },
  { name: "Psychiatry", dept: "Behavioral Health", hospital: "McLean Hospital" },
  { name: "Endocrinology", dept: "Metabolic Health", hospital: "Cleveland Clinic" },
  { name: "Pulmonology", dept: "Pulmonary & Critical Care", hospital: "National Jewish Health" },
  { name: "Gastroenterology", dept: "Digestive Diseases", hospital: "Mount Sinai Hospital" },
  { name: "Nephrology", dept: "Renal Medicine", hospital: "UCSF Medical Center" },
  { name: "Ophthalmology", dept: "Eye Care & Surgery", hospital: "Wills Eye Hospital" },
  { name: "Rheumatology", dept: "Autoimmune Disorders", hospital: "Brigham and Women's Hospital" },
  { name: "Urology", dept: "Urological Surgery", hospital: "Cedars-Sinai Medical Center" },
  { name: "Emergency Medicine", dept: "Trauma & Acute Care", hospital: "Mass General Hospital" }
];

const CONDITIONS_BY_SPECIALTY = {
  Cardiology: ["Hypertension", "Coronary Artery Disease", "Arrhythmia", "Heart Failure", "Angina Pectoris"],
  Neurology: ["Migraine", "Epilepsy", "Parkinson's Disease", "Multiple Sclerosis", "Neuropathy"],
  Pediatrics: ["Asthma", "Acute Bronchitis", "Allergic Rhinitis", "Ear Infection", "Viral Gastroenteritis"],
  Orthopedics: ["Osteoarthritis", "Lumbar Disc Herniation", "Rotator Cuff Tear", "ACL Sprain", "Carpal Tunnel Syndrome"],
  Dermatology: ["Eczema", "Psoriasis", "Acne Vulgaris", "Atopic Dermatitis", "Melanoma Screening"],
  Oncology: ["Breast Carcinoma", "Prostate Cancer", "Lymphoma", "Colon Cancer Follow-up", "Chemotherapy Review"],
  Psychiatry: ["Generalized Anxiety Disorder", "Major Depressive Disorder", "Bipolar Disorder", "PTSD", "Panic Disorder"],
  Endocrinology: ["Type 2 Diabetes", "Hypothyroidism", "Hashimoto's Thyroiditis", "Metabolic Syndrome", "Osteoporosis"],
  Pulmonology: ["Chronic Obstructive Pulmonary Disease", "Asthma", "Sleep Apnea", "Pneumonia", "Pulmonary Fibrosis"],
  Gastroenterology: ["GERD", "Ulcerative Colitis", "Crohn's Disease", "Irritable Bowel Syndrome", "Fatty Liver Disease"],
  Nephrology: ["Chronic Kidney Disease", "Kidney Stones", "Glomerulonephritis", "Polycystic Kidney Disease"],
  Ophthalmology: ["Cataract", "Glaucoma", "Macular Degeneration", "Diabetic Retinopathy", "Dry Eye Syndrome"],
  Rheumatology: ["Rheumatoid Arthritis", "Systemic Lupus", "Ankylosing Spondylitis", "Gout", "Sjogren's Syndrome"],
  Urology: ["Benign Prostatic Hyperplasia", "Urinary Tract Infection", "Nephrolithiasis", "Overactive Bladder"],
  "Emergency Medicine": ["Acute Chest Pain", "Severe Laceration", "Syncope", "Dehydration", "High Fever Crisis"]
};

const STATUSES = ["Active", "Recovered", "Critical", "Under Observation"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log("Connected to MongoDB Atlas: doctor_tracker (collection: Empty)");

    // 1. Clear previous synthetic records in Empty collection
    const deleteResult = await mongoose.connection.db.collection('Empty').deleteMany({
      docType: { $in: ['doctor', 'patient', 'employee'] }
    });
    console.log(`Cleaned existing records: ${deleteResult.deletedCount}`);

    // 2. Create Admin Employee
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password@123", salt);
    const admin = await Employee.create({
      docType: "employee",
      name: "Clinical Admin",
      email: "admin@doctortracker.com",
      password: hashedPassword,
      level: "superAdmin",
      isActive: true,
    });
    console.log(`Admin account verified: ${admin.email}`);

    // 3. Generate 60 Doctors
    const doctorDocs = [];
    const usedEmails = new Set();

    for (let i = 0; i < 60; i++) {
      const isFemale = i % 2 === 0;
      const firstName = isFemale ? randomChoice(FIRST_NAMES_FEMALE) : randomChoice(FIRST_NAMES_MALE);
      const lastName = randomChoice(LAST_NAMES);
      const name = `Dr. ${firstName} ${lastName}`;
      const specialtyObj = SPECIALTIES[i % SPECIALTIES.length];

      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@doctortracker.com`;
      if (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}_${Date.now().toString().slice(-3)}@doctortracker.com`;
      }
      usedEmails.add(email);

      const exp = randomInt(4, 32);
      const fee = randomInt(120, 450);
      const daySliceStart = randomInt(0, 2);
      const daySliceEnd = randomInt(3, 6);
      const availableDays = DAYS.slice(daySliceStart, daySliceEnd);
      if (availableDays.length === 0) availableDays.push("Monday", "Wednesday", "Friday");

      doctorDocs.push({
        docType: "doctor",
        name,
        email,
        phone: `+1 (555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        specialization: specialtyObj.name,
        department: specialtyObj.dept,
        hospital: specialtyObj.hospital,
        designation: exp > 18 ? "Department Chair & Senior Specialist" : exp > 10 ? "Senior Consultant" : "Attending Physician",
        qualifications: `MD, FACS, Board Certified in ${specialtyObj.name}`,
        experienceYears: exp,
        consultationFee: fee,
        availableDays,
        about: `Board-certified clinical specialist with over ${exp} years of comprehensive diagnostic and patient care experience at ${specialtyObj.hospital}.`,
        isActive: Math.random() > 0.08, // 92% active
      });
    }

    const insertedDoctors = await Doctor.insertMany(doctorDocs);
    console.log(`Successfully inserted ${insertedDoctors.length} doctors into MongoDB Atlas!`);

    // 4. Generate 450 Patients
    const patientDocs = [];
    const now = Date.now();

    for (let i = 0; i < 450; i++) {
      const isFemale = i % 2 === 0;
      const firstName = isFemale ? randomChoice(FIRST_NAMES_FEMALE) : randomChoice(FIRST_NAMES_MALE);
      const lastName = randomChoice(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const doctor = randomChoice(insertedDoctors);

      const conditionsList = CONDITIONS_BY_SPECIALTY[doctor.specialization] || ["General Checkup", "Chronic Fatigue", "Hypertension"];
      const condition = randomChoice(conditionsList);

      const age = doctor.specialization === "Pediatrics" ? randomInt(2, 17) : randomInt(19, 88);
      const daysAgo = randomInt(0, 85);
      const admissionDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      const status = randomChoice(STATUSES);

      patientDocs.push({
        docType: "patient",
        name,
        age,
        gender: isFemale ? "Female" : "Male",
        phone: `+1 (555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@patientmail.net`,
        condition,
        admissionDate,
        status,
        doctor: doctor._id,
        notes: `Clinical case under care of ${doctor.name}. Initial triage performed. Patient condition noted as ${status.toLowerCase()}. Follow-up scheduled.`,
      });
    }

    const insertedPatients = await Patient.insertMany(patientDocs);
    console.log(`Successfully inserted ${insertedPatients.length} patients into MongoDB Atlas!`);

    // Verification Count
    const totalDocs = await mongoose.connection.db.collection('Empty').countDocuments({
      docType: { $in: ['doctor', 'patient', 'employee'] }
    });
    console.log(`\n======================================================`);
    console.log(` TOTAL PERSISTED RECORDS IN MONGODB ATLAS: ${totalDocs}`);
    console.log(` • Doctors  : ${insertedDoctors.length}`);
    console.log(` • Patients : ${insertedPatients.length}`);
    console.log(` • Admin    : 1`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
