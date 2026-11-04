import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const clientsSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },

  isActive: { type: Boolean, required: true, default: true },

}, { timestamps: true });

export default mongoose.model('clients', clientsSchema);