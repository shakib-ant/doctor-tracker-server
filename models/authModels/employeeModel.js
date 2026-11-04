import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const employeeSchema = Schema(
  {
    docType: {
      type: String,
      default: 'employee',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    level: {
      type: String,
      enum: ['superAdmin', 'admin', 'employee'],
      required: [true, 'Please add a Level'],
    },
    dp: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'Empty',
  }
);

employeeSchema.pre(/^find/, function () {
  this.where({ docType: 'employee' });
});

employeeSchema.pre('countDocuments', function () {
  this.where({ docType: 'employee' });
});

employeeSchema.pre('save', function (next) {
  this.docType = 'employee';
  if (next) next();
});

export default mongoose.models.Employee || model('Employee', employeeSchema, 'Empty');
