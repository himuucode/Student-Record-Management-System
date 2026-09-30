# Quick manual API checks (curl based, avoids PowerShell error-body quirks)
$ErrorActionPreference = 'Continue'
$tok = (curl.exe -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}' | ConvertFrom-Json).token
Write-Output '--- search existing 101 ---'
curl.exe -s "http://localhost:5000/api/students/search/101" -H "Authorization: Bearer $tok"
Write-Output ''
Write-Output '--- search unknown ZZZ999 ---'
curl.exe -s -w " [HTTP %{http_code}]" "http://localhost:5000/api/students/search/ZZZ999" -H "Authorization: Bearer $tok"
Write-Output ''
Write-Output '--- duplicate roll number 101 ---'
curl.exe -s -w " [HTTP %{http_code}]" -X POST "http://localhost:5000/api/students" -H "Authorization: Bearer $tok" -H "Content-Type: application/json" -d "{`\"name`\":`\"Dup`\",`\"rollNumber`\":`\"101`\",`\"department`\":`\"CSE`\",`\"semester`\":1,`\"marks`\":80,`\"email`\":`\"d@d.com`\"}"
Write-Output ''
Write-Output '--- invalid email ---'
curl.exe -s -w " [HTTP %{http_code}]" -X POST "http://localhost:5000/api/students" -H "Authorization: Bearer $tok" -H "Content-Type: application/json" -d "{`\"name`\":`\"Bad Email`\",`\"rollNumber`\":`\"T-777`\",`\"department`\":`\"CSE`\",`\"semester`\":1,`\"marks`\":80,`\"email`\":`\"bad-email`\"}"