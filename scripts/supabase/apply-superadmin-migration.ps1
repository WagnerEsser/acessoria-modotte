$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$migrationFile = Join-Path $projectRoot "supabase\migrations\0006_superadmin_roles.sql"
$maxAttempts = 5

if (-not (Test-Path -LiteralPath $migrationFile)) {
  throw "Migration file not found: $migrationFile"
}

$containerName = docker ps --filter "name=^/supabase-db$" --format "{{.Names}}"

if ($containerName -ne "supabase-db") {
  throw "Supabase database container is not running. Start it with make backend first."
}

$migrationSql = Get-Content -Raw -LiteralPath $migrationFile

for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
  $output = $migrationSql |
    docker exec -i supabase-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1
  $exitCode = $LASTEXITCODE
  $outputText = $output -join "`n"

  if ($exitCode -eq 0) {
    if ($outputText) {
      Write-Host $outputText
    }

    exit 0
  }

  if ($outputText -match "deadlock detected|could not serialize access|database system is starting up") {
    Write-Warning "Supabase migration attempt $attempt failed during startup. Retrying..."
    Start-Sleep -Seconds ([Math]::Min(2 * $attempt, 10))
    continue
  }

  if ($outputText) {
    Write-Error $outputText
  }

  exit $exitCode
}

throw "Supabase migration failed after $maxAttempts attempts."
