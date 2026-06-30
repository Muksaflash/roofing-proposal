$ErrorActionPreference = "Stop"

$workspace = Resolve-Path (Join-Path $PSScriptRoot "..")
$publicPath = Join-Path $workspace "public"

if (Test-Path $publicPath) {
  $resolvedPublic = Resolve-Path $publicPath
  if (-not $resolvedPublic.Path.StartsWith($workspace.Path)) {
    throw "Public path is outside workspace: $($resolvedPublic.Path)"
  }
  Remove-Item -LiteralPath $resolvedPublic.Path -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $publicPath | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $publicPath "assets") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $publicPath "assets/projects") | Out-Null

Copy-Item -LiteralPath (Join-Path $workspace "index.html") -Destination (Join-Path $publicPath "index.html") -Force
Copy-Item -LiteralPath (Join-Path $workspace "thank-you.html") -Destination (Join-Path $publicPath "thank-you.html") -Force
Copy-Item -LiteralPath (Join-Path $workspace "privacy-policy.html") -Destination (Join-Path $publicPath "privacy-policy.html") -Force
Copy-Item -LiteralPath (Join-Path $workspace "terms-of-use.html") -Destination (Join-Path $publicPath "terms-of-use.html") -Force
Copy-Item -LiteralPath (Join-Path $workspace "accessibility-statement.html") -Destination (Join-Path $publicPath "accessibility-statement.html") -Force
Copy-Item -LiteralPath (Join-Path $workspace "favicon.ico") -Destination (Join-Path $publicPath "favicon.ico") -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/roofing-hero-placeholder.png") `
  -Destination (Join-Path $publicPath "assets/roofing-hero-placeholder.png") `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/octopus-roofing-logo.webp") `
  -Destination (Join-Path $publicPath "assets/octopus-roofing-logo.webp") `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/favicon-32x32.png") `
  -Destination (Join-Path $publicPath "assets/favicon-32x32.png") `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/favicon-192x192.png") `
  -Destination (Join-Path $publicPath "assets/favicon-192x192.png") `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/apple-touch-icon.png") `
  -Destination (Join-Path $publicPath "assets/apple-touch-icon.png") `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/projects/web") `
  -Destination (Join-Path $publicPath "assets/projects") `
  -Recurse `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/projects/hero") `
  -Destination (Join-Path $publicPath "assets/projects") `
  -Recurse `
  -Force
New-Item -ItemType Directory -Force -Path (Join-Path $publicPath "assets/projects/roofing-2026-06-22") | Out-Null
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/projects/roofing-2026-06-22/web") `
  -Destination (Join-Path $publicPath "assets/projects/roofing-2026-06-22") `
  -Recurse `
  -Force
Copy-Item `
  -LiteralPath (Join-Path $workspace "assets/projects/roofing-2026-06-22/slideshow") `
  -Destination (Join-Path $publicPath "assets/projects/roofing-2026-06-22") `
  -Recurse `
  -Force

Write-Host "Firebase public folder synced."
