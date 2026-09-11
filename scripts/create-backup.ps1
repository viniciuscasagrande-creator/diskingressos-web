$src = Resolve-Path "$PSScriptRoot\.." | Select-Object -ExpandProperty Path
$dateStr = Get-Date -Format "yyyy-MM-dd_HH-mm"
$desktopPath = "C:\Users\vinad\OneDrive\Desktop"

if (-not (Test-Path $desktopPath)) {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
}

$dest = Join-Path $desktopPath "SafeSaff_Backup_Fase28_13_1_$dateStr.zip"

Write-Host "Iniciando criacao do backup geral do SafeSaff..."
Write-Host "Origem: $src"
Write-Host "Destino: $dest"

if (Test-Path $dest) {
    Remove-Item -Path $dest -Force
}

$tempDir = Join-Path $env:TEMP ("safesaff_backup_" + [System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$exclude = @(
    "node_modules",
    ".git",
    "dist",
    ".vercel",
    "test-results",
    "playwright-report",
    ".cache",
    ".turbo"
)

Get-ChildItem -Path $src | Where-Object { $exclude -notcontains $_.Name -and $_.Extension -ne ".zip" } | ForEach-Object {
    Write-Host "Copiando $($_.Name)..."
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

Write-Host "Compactando arquivos em arquivo ZIP otimizado..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $dest -CompressionLevel Optimal

Remove-Item -Path $tempDir -Recurse -Force

if (Test-Path $dest) {
    $item = Get-Item $dest
    $sizeMB = [math]::Round($item.Length / 1MB, 2)
    Write-Host "`n========================================================"
    Write-Host "BACKUP CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "Arquivo: $($item.FullName)"
    Write-Host "Tamanho: $sizeMB MB"
    Write-Host "Data/Hora: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
    Write-Host "========================================================`n"
} else {
    Write-Error "Falha ao gerar o arquivo de backup."
    exit 1
}
