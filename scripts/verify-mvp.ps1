param(
  [string]$ApiBase = "http://127.0.0.1:8000",
  [switch]$SkipBuild,
  [switch]$SkipApi
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Step($Label) {
  Write-Host ""
  Write-Host "== $Label ==" -ForegroundColor Cyan
}

function Read-ErrorBody($ErrorRecord) {
  $response = $ErrorRecord.Exception.Response
  if (-not $response) {
    return $ErrorRecord.Exception.Message
  }
  $stream = $response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  return $reader.ReadToEnd()
}

function Login($Username, $Password) {
  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $body = @{ username = $Username; password = $Password } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "$ApiBase/auth/login" -ContentType "application/json" -Body $body -WebSession $session
  if (-not $login.success) {
    throw "Login failed for $Username"
  }
  return @{
    Session = $session
    Csrf = $login.data.csrf_token
    User = $login.data.user
  }
}

if (-not $SkipBuild) {
  Step "Frontend build"
  Push-Location (Join-Path $Root "frontend")
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed"
  }
  Pop-Location
}

Step "PHP syntax"
Get-ChildItem -Path (Join-Path $Root "backend") -Recurse -Filter *.php | ForEach-Object {
  & php -l $_.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "PHP syntax failed: $($_.FullName)"
  }
}

if (-not $SkipApi) {
  Step "API health"
  $health = Invoke-RestMethod "$ApiBase/health"
  if ($health.data.status -ne "healthy") {
    throw "API health check failed"
  }

  Step "Anonymous auth check"
  $anonymous = Invoke-RestMethod "$ApiBase/auth/me"
  if ($anonymous.success -ne $true -or $null -ne $anonymous.data.user) {
    throw "Anonymous /auth/me should return success with user null"
  }

  Step "Role login checks"
  $owner = Login "owner" "owner123"
  if ($owner.User.role -ne "owner") {
    throw "Owner login returned wrong role"
  }

  $admin = Login "admin" "admin123"
  if ($admin.User.role -ne "admin") {
    throw "Admin login returned wrong role"
  }

  $customer = Login "customer" "Admin123@"
  if ($customer.User.role -ne "customer") {
    throw "Customer login returned wrong role"
  }

  Step "Protected API smoke"
  $ownerDashboard = Invoke-RestMethod "$ApiBase/dashboard" -WebSession $owner.Session
  if ($ownerDashboard.success -ne $true) {
    throw "Owner dashboard failed"
  }

  $customerTopups = Invoke-RestMethod "$ApiBase/topups" -WebSession $customer.Session
  if ($customerTopups.success -ne $true) {
    throw "Customer topups list failed"
  }

  Step "Customer topup validation"
  $invalidTopup = @{ nominal = 1; nomor_referensi = "SMOKE-INVALID"; catatan = "invalid smoke test" } | ConvertTo-Json
  try {
    Invoke-WebRequest -Method Post -Uri "$ApiBase/topups" -ContentType "application/json" -Body $invalidTopup -WebSession $customer.Session -Headers @{ "X-CSRF-Token" = $customer.Csrf } | Out-Null
    throw "Customer invalid topup should have failed"
  } catch {
    $body = Read-ErrorBody $_
    if ($body -notmatch "Nominal top up harus antara") {
      throw "Customer topup did not reach business validation: $body"
    }
  }
}

Write-Host ""
Write-Host "MVP verification passed." -ForegroundColor Green
