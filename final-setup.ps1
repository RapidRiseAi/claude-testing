# ============================================================
#  final-setup.ps1  —  Run this ONE time from VS Code terminal
#  Opens with:  Ctrl+`  (backtick)  in VS Code
# ============================================================

Set-Location $PSScriptRoot

# 1. Git global identity -----------------------------------
Write-Host "`n[1/4] Setting git identity..." -ForegroundColor Cyan
git config --global user.name  "Xander"
git config --global user.email "team@rapidriseai.com"
Write-Host "  name : $(git config --global user.name)"  -ForegroundColor Green
Write-Host "  email: $(git config --global user.email)" -ForegroundColor Green

# 2. npm install -------------------------------------------
Write-Host "`n[2/4] npm install..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 }
Write-Host "  Done." -ForegroundColor Green

# 3. Checkout PR branch ------------------------------------
Write-Host "`n[3/4] Switching to PR branch (claude/festive-ride-m6fq9g)..." -ForegroundColor Cyan
git fetch origin claude/festive-ride-m6fq9g 2>&1
git checkout claude/festive-ride-m6fq9g 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "git checkout failed" -ForegroundColor Red; exit 1 }
Write-Host "  Branch: $(git branch --show-current)" -ForegroundColor Green

# Re-run npm install to pick up any new deps from PR branch
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install (PR branch) failed" -ForegroundColor Red; exit 1 }

# 4. Verify lint + build pass ------------------------------
Write-Host "`n[4/4] Verifying lint + build..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) { Write-Host "Lint FAILED" -ForegroundColor Red; exit 1 }
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build FAILED" -ForegroundColor Red; exit 1 }

Write-Host "`n============================================" -ForegroundColor Green
Write-Host " All done! Your env is fully set up." -ForegroundColor Green
Write-Host " Run 'npm run dev' to start the dev server." -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green
