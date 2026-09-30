/* ------------------------------------------------------------------
 * Report controller
 *
 * Every number is calculated from MongoDB - nothing is hard-coded.
 * ------------------------------------------------------------------ */
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

const PASS_MARK = Student.PASS_MARK;

/* Rounds to at most 2 decimals, dropping trailing zeros (74.25 -> 74.25, 74 -> 74) */
const round = (value) => Number(Number(value).toFixed(2));

async function buildStatistics() {
  const students = await Student.find().sort({ rollNumber: 1 }).lean({ virtuals: true });

  const totalStudents = students.length;
  const passedStudents = students.filter((s) => s.marks >= PASS_MARK).length;
  const failedStudents = totalStudents - passedStudents;
  const totalMarks = students.reduce((sum, s) => sum + s.marks, 0);
  const averageMarks = totalStudents ? round(totalMarks / totalStudents) : 0;
  const passPercentage = totalStudents ? round((passedStudents / totalStudents) * 100) : 0;
  const departments = [...new Set(students.map((s) => s.department))];

  return {
    students,
    totalStudents,
    passedStudents,
    failedStudents,
    averageMarks,
    passPercentage,
    departmentCount: departments.length,
    departments,
  };
}

/* GET /api/reports/dashboard - the four dashboard cards + student performance table */
exports.getDashboard = asyncHandler(async (req, res) => {
  const stats = await buildStatistics();
  res.json({
    success: true,
    stats: {
      totalStudents: stats.totalStudents,
      averageMarks: stats.averageMarks,
      passPercentage: stats.passPercentage,
      departments: stats.departmentCount,
    },
    students: stats.students.map((s) => ({
      id: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      department: s.department,
      semester: s.semester,
      marks: s.marks,
      email: s.email,
      status: s.marks >= PASS_MARK ? 'Pass' : 'Fail',
    })),
  });
});

/* GET /api/reports - the reports page (totals + department wise counts) */
exports.getReports = asyncHandler(async (req, res) => {
  const stats = await buildStatistics();

  const departmentMap = new Map();
  stats.students.forEach((s) => {
    departmentMap.set(s.department, (departmentMap.get(s.department) || 0) + 1);
  });

  const departmentWise = [...departmentMap.entries()]
    .map(([department, totalStudents]) => ({ department, totalStudents }))
    .sort((a, b) => a.department.localeCompare(b.department));

  res.json({
    success: true,
    report: {
      totalStudents: stats.totalStudents,
      passedStudents: stats.passedStudents,
      failedStudents: stats.failedStudents,
      averageMarks: stats.averageMarks,
      passPercentage: stats.passPercentage,
      departments: stats.departmentCount,
      departmentWise,
    },
  });
});