/* ------------------------------------------------------------------
 * Student model
 * { name, rollNumber, department, semester, marks, email }
 * rollNumber is unique.
 * ------------------------------------------------------------------ */
const mongoose = require('mongoose');

const PASS_MARK = 50; // a student passes when marks >= 50

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EEE'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters'],
      maxlength: [60, 'Student name must be at most 60 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z0-9-]{1,20}$/, 'Roll number must be 1-20 letters, digits or dashes'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      uppercase: true,
      enum: { values: DEPARTMENTS, message: 'Department is not valid' },
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks must be between 0 and 100'],
      max: [100, 'Marks must be between 0 and 100'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, 'Please enter a valid email address'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Pass / Fail is calculated from marks - it is never stored hard-coded */
studentSchema.virtual('status').get(function status() {
  return this.marks >= PASS_MARK ? 'Pass' : 'Fail';
});

studentSchema.index({ department: 1 });

module.exports = mongoose.model('Student', studentSchema);
module.exports.PASS_MARK = PASS_MARK;
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.SEMESTERS = SEMESTERS;
