/* ------------------------------------------------------------------
 * Student routes
 * GET    /api/students
 * POST   /api/students
 * GET    /api/students/search/:rollNumber
 * GET    /api/students/:id
 * PUT    /api/students/:id
 * DELETE /api/students/:id
 * ------------------------------------------------------------------ */
const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.get('/', studentController.getStudents);
router.post('/', studentController.createStudent);
router.get('/search/:rollNumber', studentController.searchByRollNumber);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;