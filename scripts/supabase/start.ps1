$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$supabaseDir = Join-Path $projectRoot "supabase\docker"
$rootEnvFile = Join-Path $projectRoot ".env"
$initialMigration = Join-Path $projectRoot "supabase\migrations\0001_initial.sql"
$initialSeed = Join-Path $projectRoot "supabase\seeds\0001_initial_seed.sql"
$composeProjectName = "luanamodotte-supabase"

if (-not (Test-Path -LiteralPath $rootEnvFile)) {
  throw "Missing root env file: $rootEnvFile. Copy .env.example to .env in the repository root first."
}

Push-Location $supabaseDir
try {
  docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" up -d
  docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" ps

  $storageReady = $false

  for ($attempt = 1; $attempt -le 60; $attempt++) {
    $result = docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" exec -T db psql -U supabase_admin -d postgres -tAc "select to_regclass('storage.buckets') is not null and to_regclass('storage.objects') is not null;" 2>$null

    if ($LASTEXITCODE -eq 0 -and $result.Trim() -eq "t") {
      $storageReady = $true
      break
    }

    Start-Sleep -Seconds 2
  }

  if (-not $storageReady) {
    throw "Storage schema was not available after Supabase startup."
  }

  $schemaReady = docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" exec -T db psql -U supabase_admin -d postgres -tAc "select to_regclass('public.properties') is not null;"

  if ($schemaReady.Trim() -ne "t") {
    Get-Content -Raw -LiteralPath $initialMigration |
      docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" exec -T db psql -v ON_ERROR_STOP=1 -U supabase_admin -d postgres

    if ($LASTEXITCODE -ne 0) {
      throw "Failed to apply the consolidated initial migration."
    }

    Get-Content -Raw -LiteralPath $initialSeed |
      docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" exec -T db psql -v ON_ERROR_STOP=1 -U supabase_admin -d postgres

    if ($LASTEXITCODE -ne 0) {
      throw "Failed to apply the initial seed."
    }
  }
}
finally {
  Pop-Location
}
