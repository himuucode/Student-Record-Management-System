/* ==================================================================
   students.js - Figure 4: View Students (list, edit, delete)
   ================================================================== */
(function () {
  const MESSAGE_ID = 'studentsMessage';
  const tableBody = document.getElementById('studentsBody');
  const searchInput = document.getElementById('studentSearch');
  const modal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');

  let students = [];

  const statusCell = (status) =>
    `<span class="${status === 'Pass' ? 'status-pass' : 'status-fail'}">${status}</span>`;

  function renderTable() {
    const term = searchInput.value.trim().toLowerCase();
    const rows = term
      ? students.filter((s) => `${s.rollNumber} ${s.name} ${s.department} ${s.semester} ${s.marks} ${s.status}`.toLowerCase().includes(term))
      : students;

    if (!rows.length) {
      tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No student records found.</td></tr>';
      return;
    }

    tableBody.innerHTML = rows.map((s) => `
      <tr>
        <td>${s.rollNumber}</td>
        <td>${s.name}</td>
        <td>${s.department}</td>
        <td>${s.semester}</td>
        <td>${s.marks}</td>
        <td>${statusCell(s.status)}</td>
        <td class="col-center">
          <div class="action-cell">
            <button class="icon-btn edit" title="Edit" data-edit="${s.id}">${window.Icons.edit}</button>
            <button class="icon-btn delete" title="Delete" data-delete="${s.id}">${window.Icons.delete}</button>
          </div>
        </td>
      </tr>`).join('');
  }

  async function load() {
    try {
      const { students: rows } = await window.Api.getStudents();
      students = rows;
      renderTable();
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to load students.', 'error');
      tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">Unable to load student records.</td></tr>';
    }
  }

  /* ------------------------------- edit ------------------------------- */
  function openEdit(student) {
    document.getElementById('editId').value = student.id;
    document.getElementById('editName').value = student.name;
    document.getElementById('editRollNumber').value = student.rollNumber;
    document.getElementById('editDepartment').value = student.department;
    document.getElementById('editSemester').value = String(student.semester);
    document.getElementById('editMarks').value = student.marks;
    document.getElementById('editEmail').value = student.email;
    window.Layout.hideMessage('editMessage');
    modal.classList.add('show');
  }

  function closeEdit() {
    modal.classList.remove('show');
  }

  async function submitEdit(event) {
    event.preventDefault();
    const id = document.getElementById('editId').value;
    const payload = {
      name: document.getElementById('editName').value.trim(),
      rollNumber: document.getElementById('editRollNumber').value.trim(),
      department: document.getElementById('editDepartment').value,
      semester: document.getElementById('editSemester').value,
      marks: document.getElementById('editMarks').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
    };

    try {
      const { message } = await window.Api.updateStudent(id, payload);
      closeEdit();
      window.Layout.showMessage(MESSAGE_ID, message || 'Student updated successfully.', 'success');
      await load();
    } catch (err) {
      window.Layout.showMessage('editMessage', err.message || 'Unable to update the student.', 'error');
    }
  }

  /* ------------------------------ delete ------------------------------ */
  async function removeStudent(id) {
    const student = students.find((s) => s.id === id);
    const label = student ? `${student.name} (${student.rollNumber})` : 'this student';
    if (!window.confirm(`Are you sure you want to delete ${label}? This action cannot be undone.`)) return;

    try {
      const { message } = await window.Api.deleteStudent(id);
      window.Layout.showMessage(MESSAGE_ID, message || 'Student deleted successfully.', 'success');
      await load();
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to delete the student.', 'error');
    }
  }

  function onTableClick(event) {
    const editBtn = event.target.closest('[data-edit]');
    if (editBtn) {
      const student = students.find((s) => s.id === editBtn.getAttribute('data-edit'));
      if (student) openEdit(student);
      return;
    }
    const deleteBtn = event.target.closest('[data-delete]');
    if (deleteBtn) removeStudent(deleteBtn.getAttribute('data-delete'));
  }

  tableBody.addEventListener('click', onTableClick);
  searchInput.addEventListener('input', renderTable);
  editForm.addEventListener('submit', submitEdit);
  document.getElementById('editCancel').addEventListener('click', closeEdit);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeEdit(); });

  (async () => {
    const admin = await window.Layout.render('view-students', 'View Students');
    if (!admin) return;
    await load();
  })();
})();