Set-Location $PSScriptRoot

# Delete stale lock file
$lock = ".git\config.lock"
if (Test-Path $lock) {
    Remove-Item $lock -Force
    Write-Host "Deleted config.lock" -ForegroundColor Green
} else {
    Write-Host "No config.lock found (already clean)" -ForegroundColor Yellow
}

# Checkout PR branch
Write-Host "`nFetching + checking out PR branch..." -ForegroundColor Cyan
git fetch origin claude/festive-ride-m6fq9g
git checkout claude/festive-ride-m6fq9g
if ($LASTEXITCODE -ne 0) { Write-Host "CHECKOUT FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Branch: $(git branch --show-current)" -ForegroundColor Green

# npm install (picks up any new deps from PR branch)
Write-Host "`nnpm install..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install FAILED" -ForegroundColor Red; exit 1 }

# Lint
Write-Host "`nnpm run lint..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) { Write-Host "LINT FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Lint PASSED" -ForegroundColor Green

# Build
Write-Host "`nnpm run build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED" -ForegroundColor Red; exit 1 }
Write-Host "Build PASSED" -ForegroundColor Green

Write-Host "`nAll done! Run 'npm run dev' to start the dev server." -ForegroundColor Green
