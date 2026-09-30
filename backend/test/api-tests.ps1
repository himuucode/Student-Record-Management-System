# ------------------------------------------------------------------
# SRMS end-to-end API test (run while the server is up):
#   powershell -File backend/test/api-tests.ps1
# ------------------------------------------------------------------
$ErrorActionPreference = 'Continue'
$base = 'http://localhost:5000/api'
$pass = 0; $fail = 0

function Check($name, $condition, $detail) {
  if ($condition) { $script:pass++; Write-Output "PASS  $name" }
  else { $script:fail++; Write-Output "FAIL  $name  -> $detail" }
}

function Invoke-Api($method, $url, $token, $body) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  try {
    if ($null -ne $body) {
      $r = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -Body ($body | ConvertTo-Json -Depth 5) -ContentType 'application/json' -UseBasicParsing -TimeoutSec 20
    } else {
      $r = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -UseBasicParsing -TimeoutSec 20
    }
    return @{ status = [int]$r.StatusCode; json = ($r.Content | ConvertFrom-Json) }
  } catch {
    $status = 0
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    $content = ''
    if ($_.Exception.Response) {
      $stream = $_.Exception.Response.GetResponseStream()
      if ($stream) { $content = (New-Object IO.StreamReader($stream)).ReadToEnd() }
    }
    $json = $null
    try { $json = $content | ConvertFrom-Json } catch {}
    return @{ status = $status; json = $json; content = $content }
  }
}

Write-Output '=== 1. health ==='
$h = Invoke-Api 'GET' "$base/health" $null
Check 'GET /api/health' ($h.status -eq 200 -and $h.json.database -eq 'connected') "$($h.status) $($h.content)"

Write-Output '=== 2. auth ==='
$bad = Invoke-Api 'POST' "$base/auth/login" $null @{ username = 'admin'; password = 'nope' }
Check 'login rejects a wrong password' ($bad.status -eq 401) "$($bad.status) $($bad.content)"
$bad2 = Invoke-Api 'POST' "$base/auth/login" $null @{ username = 'admin' }
Check 'login requires both fields' ($bad2.status -eq 400) "$($bad2.status) $($bad2.content)"
$login = Invoke-Api 'POST' "$base/auth/login" $null @{ username = 'admin'; password = 'admin123' }
Check 'login succeeds with admin/admin123' ($login.status -eq 200 -and $login.json.token) "$($login.status) $($login.content)"
$token = $login.json.token
$me = Invoke-Api 'GET' "$base/auth/me" $token
Check 'GET /api/auth/me returns the admin' ($me.status -eq 200 -and $me.json.admin.username -eq 'admin') "$($me.status) $($me.content)"
$noAuth = Invoke-Api 'GET' "$base/students" $null
Check 'students require authentication' ($noAuth.status -eq 401) "$($noAuth.status) $($noAuth.content)"

Write-Output '=== 3. students CRUD ==='
$list = Invoke-Api 'GET' "$base/students" $token
Check 'GET /api/students lists the seeded students' ($list.status -eq 200 -and $list.json.count -ge 4) "$($list.status) $($list.content)"
$rahul = $list.json.students | Where-Object { $_.rollNumber -eq '101' }
Check 'sample student Rahul Sharma present' ($rahul -and $rahul.name -eq 'Rahul Sharma' -and $rahul.status -eq 'Pass') "$($rahul | ConvertTo-Json -Compress)"
$riya = $list.json.students | Where-Object { $_.rollNumber -eq '104' }
Check 'sample student Riya Patel is Fail (45 marks)' ($riya -and $riya.status -eq 'Fail') "$($riya | ConvertTo-Json -Compress)"

$created = Invoke-Api 'POST' "$base/students" $token @{ name = 'Test Student'; rollNumber = 'T-900'; department = 'CSE'; semester = 5; marks = 66; email = 'test.student@gmail.com' }
Check 'POST /api/students creates a student' ($created.status -eq 201 -and $created.json.student.rollNumber -eq 'T-900') "$($created.status) $($created.content)"
$newId = $created.json.student.id
$dup = Invoke-Api 'POST' "$base/students" $token @{ name = 'Another'; rollNumber = 'T-900'; department = 'IT'; semester = 2; marks = 55; email = 'another@gmail.com' }
Check 'duplicate roll number is rejected (409)' ($dup.status -eq 409) "$($dup.status) $($dup.content)"
$invalid = Invoke-Api 'POST' "$base/students" $token @{ name = 'X'; rollNumber = 'T-901'; department = 'CSE'; semester = 9; marks = 250; email = 'not-an-email' }
Check 'invalid marks / semester / email rejected (400)' ($invalid.status -eq 400) "$($invalid.status) $($invalid.content)"
$missing = Invoke-Api 'POST' "$base/students" $token @{ name = ''; rollNumber = ''; department = ''; semester = ''; marks = ''; email = '' }
Check 'missing fields rejected (400)' ($missing.status -eq 400) "$($missing.status) $($missing.content)"

$updated = Invoke-Api 'PUT' "$base/students/$newId" $token @{ name = 'Test Student Updated'; rollNumber = 'T-900'; department = 'IT'; semester = 6; marks = 42; email = 'updated@gmail.com' }
Check 'PUT /api/students/:id updates the student' ($updated.status -eq 200 -and $updated.json.student.name -eq 'Test Student Updated' -and $updated.json.student.status -eq 'Fail') "$($updated.status) $($updated.content)"

$found = Invoke-Api 'GET' "$base/students/search/T-900" $token
Check 'GET /api/students/search/:rollNumber finds the student' ($found.status -eq 200 -and $found.json.student.email -eq 'updated@gmail.com') "$($found.status) $($found.content)"

$afterEcho = Invoke-Api 'GET' "$base/students/search/ZZZ999" $token
Check 'search for an unknown roll number returns 404' ($afterEcho.status -eq 404) "$($afterEcho.status)"

$deleted = Invoke-Api 'DELETE' "$base/students/$newId" $token
Check 'DELETE /api/students/:id deletes the student' ($deleted.status -eq 200) "$($deleted.status) $($deleted.content)"
$deletedAgain = Invoke-Api 'DELETE' "$base/students/$newId" $token
Check 'deleting an unknown student returns 404' ($deletedAgain.status -eq 404) "$($deletedAgain.status) $($deletedAgain.content)"

Write-Output '=== 4. dashboard + reports ==='
$dash = Invoke-Api 'GET' "$base/reports/dashboard" $token
Check 'GET /api/reports/dashboard works' ($dash.status -eq 200 -and $dash.json.stats.totalStudents -ge 4) "$($dash.status) $($dash.content)"
Check 'dashboard statistics are calculated' ($dash.json.stats.departments -eq 4 -and $dash.json.stats.passPercentage -eq 75) "$($dash.json.stats | ConvertTo-Json -Compress)"
$rep = Invoke-Api 'GET' "$base/reports" $token
Check 'GET /api/reports works' ($rep.status -eq 200 -and $rep.json.report.passedStudents -eq 3 -and $rep.json.report.failedStudents -eq 1) "$($rep.status) $($rep.content)"
Check 'department wise counts are dynamic' ($rep.json.report.departmentWise.Count -ge 4) "$($rep.json.report.departmentWise | ConvertTo-Json -Compress)"

Write-Output '=== 5. settings ==='
$set = Invoke-Api 'GET' "$base/settings" $token
Check 'GET /api/settings returns defaults' ($set.status -eq 200 -and $set.json.settings.theme -eq 'Light') "$($set.status) $($set.content)"
$saved = Invoke-Api 'PUT' "$base/settings" $token @{ administratorName = 'Himanshu Dwivedi'; email = 'admin@lpu.in'; collegeName = 'Lovely Professional University'; theme = 'Light' }
Check 'PUT /api/settings saves the settings' ($saved.status -eq 200 -and $saved.json.settings.administratorName -eq 'Himanshu Dwivedi') "$($saved.status) $($saved.content)"
$badTheme = Invoke-Api 'PUT' "$base/settings" $token @{ administratorName = 'A'; email = 'a@b.in'; collegeName = 'C'; theme = 'Neon' }
Check 'invalid theme rejected (400)' ($badTheme.status -eq 400) "$($badTheme.status) $($badTheme.content)"
$reloaded = Invoke-Api 'GET' "$base/settings" $token
Check 'settings persist in MongoDB' ($reloaded.json.settings.administratorName -eq 'Himanshu Dwivedi' -and $reloaded.json.settings.email -eq 'admin@lpu.in') "$($reloaded.content)"

Write-Output '=== 6. logout ==='
$out = Invoke-Api 'POST' "$base/auth/logout" $token
Check 'POST /api/auth/logout works' ($out.status -eq 200) "$($out.status) $($out.content)"
$afterLogout = Invoke-Api 'GET' "$base/students" $token
Check 'the token is invalid after logout' ($afterLogout.status -eq 401) "$($afterLogout.status) $($afterLogout.content)"

Write-Output ''
Write-Output "RESULT: $pass passed, $fail failed"

Write-Output '=== 7. restore development defaults ==='
$fresh = Invoke-Api 'POST' "$base/auth/login" $null @{ username = 'admin'; password = 'admin123' }
$freshToken = $fresh.json.token
$restore = Invoke-Api 'PUT' "$base/settings" $freshToken @{ administratorName = 'Administrator'; email = 'admin@example.com'; collegeName = 'Lovely Professional University'; theme = 'Light' }
Check 'settings restored to defaults' ($restore.status -eq 200 -and $restore.json.settings.administratorName -eq 'Administrator') "$($restore.status) $($restore.content)"
$final = Invoke-Api 'GET' "$base/students" $freshToken
Check 'students collection intact (4 sample students)' ($final.status -eq 200 -and $final.json.count -eq 4) "$($final.status) $($final.content)"