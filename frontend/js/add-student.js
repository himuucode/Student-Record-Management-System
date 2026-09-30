/* ==================================================================
   add-student.js - Figure 3: Add Student
   ================================================================== */
(function () {
  const MESSAGE_ID = 'addMessage';
  const form = document.getElementById('addStudentForm');
  const saveBtn = document.getElementById('saveStudentBtn');
  const rollNumberEl = document.getElementById('rollNumber');
  const marksEl = document.getElementById('marks');
  const emailEl = document.getElementById('email');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  /* Digits only for the roll number / marks inputs */
  marksEl.addEventListener('input', () => {
    marksEl.value = marksEl.value.replace(/[^\d.]/g, '');
  });
  rollNumberEl.addEventListener('input', () => {
    rollNumberEl.value = rollNumberEl.value.replace(/[^\w-]/g, '').toUpperCase();
  });

  function validate() {
    const name = document.getElementById('studentName').value.trim();
    const rollNumber = rollNumberEl.value.trim();
    const department = document.getElementById('department').value;
    const semester = document.getElementById('semester').value;
    const marks = marksEl.value.trim();
    const email = emailEl.value.trim();

    if (!name) return 'Please enter the student name.';
    if (name.length < 2) return 'Student name must be at least 2 characters.';
    if (!rollNumber) return 'Please enter the roll number.';
    if (!/^[A-Za-z0-9-]{1,20}$/.test(rollNumber)) return 'Roll number must be 1-20 letters, digits or dashes.';
    if (!department) return 'Please select a department.';
    if (!semester) return 'Please select a semester.';
    if (marks === '') return 'Please enter the marks.';
    if (Number.isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > 100) {
      return 'Marks must be a number between 0 and 100.';
    }
    if (!email) return 'Please enter the email address.';
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
    return '';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.Layout.hideMessage(MESSAGE_ID);

    const error = validate();
    if (error) {
      window.Layout.showMessage(MESSAGE_ID, error, 'error');
      return;
    }

    saveBtn.disabled = true;

    try {
      const { message } = await window.Api.createStudent({
        name: document.getElementById('studentName').value.trim(),
        rollNumber: rollNumberEl.value.trim(),
        department: document.getElementById('department').value,
        semester: document.getElementById('semester').value,
        marks: marksEl.value.trim(),
        email: emailEl.value.trim(),
      });

      window.Layout.showMessage(MESSAGE_ID, message || 'Student saved successfully.', 'success');
      form.reset();
      document.getElementById('studentName').focus();
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to save the student.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });

  (async () => {
    const admin = await window.Layout.render('add-student', 'Add Student');
    if (!admin) return;
  })();
})();