$src = "C:\Users\vinad\OneDrive\Documentos\safesaff"
$dest = "C:\Users\vinad\OneDrive\Documentos\SafeSaff_Backup_Geral_Fase25_8_2_2026-09-02.zip"

Write-Host "Iniciando criacao do backup geral em $dest ..."

if (Test-Path $dest) {
    Remove-Item -Path $dest -Force
}

$tempDir = Join-Path $env:TEMP ("safesaff_backup_" + [System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$exclude = @("node_modules", ".git", "dist", ".vercel", "_tmp_fase25_8_2", ".cache")

Get-ChildItem -Path $src | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    Write-Host "Copiando $($_.Name)..."
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

Write-Host "Compactando arquivos..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $dest -CompressionLevel Optimal

Remove-Item -Path $tempDir -Recurse -Force

if (Test-Path $dest) {
    $item = Get-Item $dest
    $sizeMB = [math]::Round($item.Length / 1MB, 2)
    Write-Host "BACKUP_CONCLUIDO: $($item.FullName) ($sizeMB MB)"
} else {
    Write-Error "Falha ao gerar o arquivo de backup."
}
