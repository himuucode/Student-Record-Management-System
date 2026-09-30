/* ==================================================================
   search.js - Figure 5: Search Student (by roll number)
   ================================================================== */
(function () {
  const MESSAGE_ID = 'searchMessage';
  const input = document.getElementById('rollNumberInput');
  const button = document.getElementById('searchBtn');
  const detailsCard = document.getElementById('detailsCard');

  function renderStudent(student) {
    const rows = [
      ['Name', student.name],
      ['Roll No', student.rollNumber],
      ['Department', student.department],
      ['Semester', student.semester],
      ['Marks', student.marks],
      ['Email', student.email],
    ];
    document.getElementById('detailsList').innerHTML = rows.map(([label, value]) => `
      <div class="detail-row">
        <span class="detail-label">${label}:</span>
        <span class="detail-value">${value}</span>
      </div>`).join('');
    detailsCard.style.display = '';
  }

  async function search() {
    window.Layout.hideMessage(MESSAGE_ID);
    const rollNumber = input.value.trim();

    if (!rollNumber) {
      detailsCard.style.display = 'none';
      window.Layout.showMessage(MESSAGE_ID, 'Please enter a roll number to search.', 'error');
      return;
    }

    button.disabled = true;
    try {
      const { student } = await window.Api.searchByRollNumber(rollNumber);
      renderStudent(student);
      window.Layout.showMessage(MESSAGE_ID, `Student found: ${student.name}`, 'success');
    } catch (err) {
      detailsCard.style.display = 'none';
      window.Layout.showMessage(MESSAGE_ID, err.message || `Student not found for roll number "${rollNumber}".`, 'error');
    } finally {
      button.disabled = false;
    }
  }

  document.getElementById('searchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    search();
  });

  (async () => {
    const admin = await window.Layout.render('search-student', 'Search Student');
    if (!admin) return;
  })();
})();