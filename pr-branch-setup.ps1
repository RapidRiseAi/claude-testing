# ==============================================================
#  claude-testing — PR #6 branch setup + lint/build check
#  Run AFTER you've confirmed the dev server works (Ctrl+C it first)
# ==============================================================

Set-Location $PSScriptRoot

Write-Host "`n=== Fetching & checking out PR #6 branch ===" -ForegroundColor Cyan
git fetch origin claude/festive-ride-m6fq9g
git checkout claude/festive-ride-m6fq9g
if ($LASTEXITCODE -ne 0) { Write-Host "git checkout failed" -ForegroundColor Red; exit 1 }

Write-Host "`n=== npm install (picks up any new deps from the PR) ===" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 }

Write-Host "`n=== npm run lint ===" -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) { Write-Host "Lint FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Lint passed!" -ForegroundColor Green

Write-Host "`n=== npm run build ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Build passed!" -ForegroundColor Green

Write-Host "`nAll checks passed. You're on branch claude/festive-ride-m6fq9g with the latest tooling." -ForegroundColor Green
