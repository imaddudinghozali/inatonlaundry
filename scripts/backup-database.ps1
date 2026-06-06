param(
  [string]$Database = "inaton_laundry",
  [string]$MysqlBin = "C:\xampp\mysql\bin",
  [string]$OutDir = "backup",
  [string]$User = "root",
  [string]$Password = "",
  [int]$Keep = 7
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$DumpExe = Join-Path $MysqlBin "mysqldump.exe"
$BackupDir = Join-Path $Root $OutDir

if (-not (Test-Path $DumpExe)) {
  throw "mysqldump.exe tidak ditemukan: $DumpExe"
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$file = Join-Path $BackupDir "$Database-$timestamp.sql"
$args = @("-u", $User, "--single-transaction", "--routines", "--triggers", $Database)
if ($Password -ne "") {
  $args = @("-u", $User, "-p$Password", "--single-transaction", "--routines", "--triggers", $Database)
}

& $DumpExe @args | Set-Content -Encoding UTF8 -Path $file
if ($LASTEXITCODE -ne 0) {
  throw "Backup database gagal."
}

Get-ChildItem -Path $BackupDir -Filter "$Database-*.sql" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -Skip $Keep |
  Remove-Item -Force

Write-Host "Backup selesai: $file" -ForegroundColor Green
