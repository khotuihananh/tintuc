$tab = 'C:\Users\nguye\Downloads\weather-app (2)\components\TabBar.tsx'
if (Test-Path $tab) {
  $s = Get-Content $tab -Raw
  if (-not $s.Contains('/premier-league')) {
    $s = $s.Replace('grid-cols-4', 'grid-cols-5')
    $old = '  { href: "/bank", label: "Lãi suất", icon: "🏦" },'
    $new = $old + "`r`n  { href: `"/premier-league`", label: `"Ngoại hạng`", icon: `"⚽`" },"
    $s = $s.Replace($old, $new)
    Set-Content -Encoding UTF8 $tab $s
    Write-Output 'nav-updated'
  } else { Write-Output 'nav-already-updated' }
} else { Write-Output 'nav-not-found' }
