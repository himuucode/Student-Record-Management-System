/* ==================================================================
   dashboard.js - Figure 2: Dashboard
   Four statistic cards + Student Performance table.
   Every value is calculated by the backend from MongoDB.
   ================================================================== */
(function () {
  const MESSAGE_ID = 'dashboardMessage';
  const tableBody = document.getElementById('performanceBody');
  const searchInput = document.getElementById('performanceSearch');

  let students = [];

  function statusCell(status) {
    const cls = status === 'Pass' ? 'status-pass' : 'status-fail';
    return `<span class="${cls}">${status}</span>`;
  }

  function renderTable(rows) {
    if (!rows.length) {
      tableBody.innerHTML = '<tr class="empty-row"><td colspan="6">No student records found.</td></tr>';
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
      </tr>`).join('');
  }

  function filterRows(term) {
    const value = term.trim().toLowerCase();
    if (!value) return students;
    return students.filter((s) => `${s.rollNumber} ${s.name} ${s.department} ${s.semester} ${s.marks} ${s.status}`
      .toLowerCase()
      .includes(value));
  }

  async function load() {
    try {
      const { stats, students: rows } = await window.Api.getDashboard();
      students = rows;

      document.getElementById('totalStudents').textContent = stats.totalStudents;
      document.getElementById('averageMarks').textContent = `${stats.averageMarks}%`;
      document.getElementById('passPercentage').textContent = `${stats.passPercentage}%`;
      document.getElementById('departments').textContent = stats.departments;

      renderTable(filterRows(searchInput.value));
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to load dashboard data.', 'error');
      tableBody.innerHTML = '<tr class="empty-row"><td colspan="6">Unable to load student records.</td></tr>';
    }
  }

  searchInput.addEventListener('input', () => renderTable(filterRows(searchInput.value)));

  (async () => {
    const admin = await window.Layout.render('dashboard', 'Dashboard');
    if (!admin) return;
    await load();
  })();
})();