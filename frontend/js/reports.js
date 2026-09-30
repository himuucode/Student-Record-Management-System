/* ==================================================================
   reports.js - Figure 6: Reports
   Totals + department wise student counts (calculated in MongoDB)
   ================================================================== */
(function () {
  const MESSAGE_ID = 'reportsMessage';
  const tableBody = document.getElementById('departmentBody');

  async function load() {
    try {
      const { report } = await window.Api.getReports();

      document.getElementById('reportTotal').textContent = report.totalStudents;
      document.getElementById('reportPassed').textContent = report.passedStudents;
      document.getElementById('reportFailed').textContent = report.failedStudents;
      document.getElementById('reportAverage').textContent = `${report.averageMarks}%`;

      if (!report.departmentWise.length) {
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="2">No student records found.</td></tr>';
        return;
      }

      tableBody.innerHTML = report.departmentWise.map((row) => `
        <tr>
          <td>${row.department}</td>
          <td class="col-center">${row.totalStudents}</td>
        </tr>`).join('');
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to load the report.', 'error');
      tableBody.innerHTML = '<tr class="empty-row"><td colspan="2">Unable to load the report.</td></tr>';
    }
  }

  (async () => {
    const admin = await window.Layout.render('reports', 'Reports');
    if (!admin) return;
    await load();
  })();
})();