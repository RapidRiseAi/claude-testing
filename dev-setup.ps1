# ==============================================================
#  claude-testing — local dev setup script
#  Run this from VS Code's terminal (PowerShell) inside the repo
# ==============================================================

Set-Location $PSScriptRoot

Write-Host "`n=== STEP 1: Node.js version ===" -ForegroundColor Cyan
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js not found! Install Node 22 from https://nodejs.org/en/download" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== STEP 2: npm install ===" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 }

Write-Host "`n=== STEP 3: Starting dev server (press Ctrl+C to stop) ===" -ForegroundColor Cyan
Write-Host "Open http://localhost:5173 in your browser once it starts.`n" -ForegroundColor Yellow
npm run dev
