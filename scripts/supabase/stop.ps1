$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$supabaseDir = Join-Path $projectRoot "supabase\docker"
$rootEnvFile = Join-Path $projectRoot ".env"

if (-not (Test-Path -LiteralPath $rootEnvFile)) {
  throw "Missing root env file: $rootEnvFile. Copy .env.example to .env in the repository root first."
}

Push-Location $supabaseDir
try {
  docker compose --env-file "$rootEnvFile" down
}
finally {
  Pop-Location
}
