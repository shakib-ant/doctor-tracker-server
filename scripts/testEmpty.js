import '../config/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('CONNECTED');

  const testSchema = new mongoose.Schema({
    docType: { type: String, default: 'testDoc' },
    name: String,
  }, { collection: 'Empty', timestamps: true });

  const TestModel = mongoose.model('TestModel', testSchema);

  const doc = await TestModel.create({ name: 'Dr. Test Atlas' });
  console.log('CREATED_DOC_ID:', doc._id);

  const found = await TestModel.find({ docType: 'testDoc' }).lean();
  console.log('FOUND_COUNT:', found.length, 'NAME:', found[0].name);

  // Clean test
  await TestModel.deleteOne({ _id: doc._id });
  console.log('DELETED_TEST_DOC');

  await mongoose.disconnect();
} catch (e) {
  console.error('TEST_ERR:', e.message);
}
