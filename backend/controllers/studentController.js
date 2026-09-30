/* ------------------------------------------------------------------
 * Student controller - complete CRUD + search
 * ------------------------------------------------------------------ */
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const ROLL_RE = /^[A-Za-z0-9-]{1,20}$/;

/* Shared validation for create / update (server side, never trust the client) */
function validateStudentPayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  const has = (key) => body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== '';

  if (has('name')) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 60) errors.push('Student name must be between 2 and 60 characters');
    else data.name = name;
  } else if (!partial) errors.push('Student name is required');

  if (has('rollNumber')) {
    const roll = String(body.rollNumber).trim().toUpperCase();
    if (!ROLL_RE.test(roll)) errors.push('Roll number must be 1-20 letters, digits or dashes');
    else data.rollNumber = roll;
  } else if (!partial) errors.push('Roll number is required');

  if (has('department')) {
    const dept = String(body.department).trim().toUpperCase();
    if (!Student.DEPARTMENTS.includes(dept)) errors.push(`Department must be one of ${Student.DEPARTMENTS.join(', ')}`);
    else data.department = dept;
  } else if (!partial) errors.push('Department is required');

  if (has('semester')) {
    const semester = Number(body.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 8) errors.push('Semester must be a whole number between 1 and 8');
    else data.semester = semester;
  } else if (!partial) errors.push('Semester is required');

  if (has('marks')) {
    const marks = Number(body.marks);
    if (Number.isNaN(marks) || marks < 0 || marks > 100) errors.push('Marks must be a number between 0 and 100');
    else data.marks = marks;
  } else if (!partial) errors.push('Marks are required');

  if (has('email')) {
    const email = String(body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address');
    else data.email = email;
  } else if (!partial) errors.push('Email is required');

  return { errors, data };
}

function serialize(student) {
  return {
    id: student._id,
    name: student.name,
    rollNumber: student.rollNumber,
    department: student.department,
    semester: student.semester,
    marks: student.marks,
    email: student.email,
    status: student.status,
  };
}

/* GET /api/students  (?search= optional filter on roll number / name / department) */
exports.getStudents = asyncHandler(async (req, res) => {
  const filter = {};
  const search = (req.query.search || '').trim();
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { rollNumber: { $regex: safe, $options: 'i' } },
      { name: { $regex: safe, $options: 'i' } },
      { department: { $regex: safe, $options: 'i' } },
    ];
  }

  const students = await Student.find(filter).sort({ rollNumber: 1 });
  res.json({ success: true, count: students.length, students: students.map(serialize) });
});

/* GET /api/students/:id */
exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }
  return res.json({ success: true, student: serialize(student) });
});

/* GET /api/students/search/:rollNumber */
exports.searchByRollNumber = asyncHandler(async (req, res) => {
  const roll = String(req.params.rollNumber || '').trim().toUpperCase();
  if (!roll) {
    return res.status(400).json({ success: false, message: 'Please enter a roll number to search.' });
  }
  const student = await Student.findOne({ rollNumber: roll });
  if (!student) {
    return res.status(404).json({ success: false, message: `Student not found for roll number "${roll}".` });
  }
  return res.json({ success: true, student: serialize(student) });
});

/* POST /api/students */
exports.createStudent = asyncHandler(async (req, res) => {
  const { errors, data } = validateStudentPayload(req.body || {});
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const alreadyExists = await Student.findOne({ rollNumber: data.rollNumber });
  if (alreadyExists) {
    return res.status(409).json({
      success: false,
      message: `Roll number "${data.rollNumber}" already exists. Please use a different one.`,
    });
  }

  const student = await Student.create(data);
  return res.status(201).json({
    success: true,
    message: `Student "${student.name}" saved successfully.`,
    student: serialize(student),
  });
});

/* PUT /api/students/:id */
exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const { errors, data } = validateStudentPayload(req.body || {}, { partial: true });
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  if (data.rollNumber && data.rollNumber !== student.rollNumber) {
    const clash = await Student.findOne({ rollNumber: data.rollNumber, _id: { $ne: student._id } });
    if (clash) {
      return res.status(409).json({
        success: false,
        message: `Roll number "${data.rollNumber}" already exists. Please use a different one.`,
      });
    }
  }

  Object.assign(student, data);
  await student.save();

  return res.json({
    success: true,
    message: `Student "${student.name}" updated successfully.`,
    student: serialize(student),
  });
});

/* DELETE /api/students/:id */
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }
  return res.json({ success: true, message: `Student "${student.name}" deleted successfully.` });
});