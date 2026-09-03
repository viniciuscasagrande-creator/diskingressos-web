param(
  [string]$BaseUrl = "http://127.0.0.1:3000"
)

$ErrorActionPreference = "Stop"
$env:PLAYWRIGHT_BASE_URL = $BaseUrl

Write-Host "SafeSaff / PDT - Homologacao Playwright" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor DarkGray

$steps = @(
  @{ Name = "CRITICAL"; Command = "npm run test:pw:critical" },
  @{ Name = "EVENT OS"; Command = "npm run test:pw:event-os" },
  @{ Name = "RUNTIME"; Command = "npm run test:pw:runtime" },
  @{ Name = "RESPONSIVE"; Command = "npm run test:pw:responsive" }
)

foreach ($step in $steps) {
  Write-Host "`n=== $($step.Name) ===" -ForegroundColor Yellow
  Invoke-Expression $step.Command
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FALHA: $($step.Name). Homologacao BLOQUEADA." -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

Write-Host "`nPASS: todos os gates Playwright foram aprovados." -ForegroundColor Green
