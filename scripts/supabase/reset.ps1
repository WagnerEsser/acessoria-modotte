$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$supabaseDir = Join-Path $projectRoot "supabase\docker"
$rootEnvFile = Join-Path $projectRoot ".env"
$databaseDataDir = Join-Path $supabaseDir "volumes\db\data"
$composeProjectName = "luanamodotte-supabase"

if (-not (Test-Path -LiteralPath $rootEnvFile)) {
  throw "Missing root env file: $rootEnvFile. Copy .env.example to .env in the repository root first."
}

Push-Location $supabaseDir
try {
  docker compose --project-name "$composeProjectName" --env-file "$rootEnvFile" down --volumes --remove-orphans
}
finally {
  Pop-Location
}

$resolvedProjectRoot = [System.IO.Path]::GetFullPath($projectRoot.Path)
$resolvedDatabaseDataDir = [System.IO.Path]::GetFullPath($databaseDataDir)
$expectedPrefix = $resolvedProjectRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) +
  [System.IO.Path]::DirectorySeparatorChar

if (-not $resolvedDatabaseDataDir.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to remove a database path outside the project root: $resolvedDatabaseDataDir"
}

if (Test-Path -LiteralPath $resolvedDatabaseDataDir) {
  Remove-Item -LiteralPath $resolvedDatabaseDataDir -Recurse -Force
}

Write-Host "Ambiente local do Supabase resetado. Execute 'make up' para recriar tudo."
