# Öppnar borttagningssidorna i sajter.tsv i din webbläsare, en i taget.
# Skriptet skickar inget och sparar inget. Du signerar själv med BankID.
# Kör: powershell -ExecutionPolicy Bypass -File .\oppna-sidorna.ps1

$sajter = @(Import-Csv -Path (Join-Path $PSScriptRoot 'sajter.tsv') -Delimiter "`t" -Encoding UTF8)
$total = $sajter.Count
$gjorda = 0
$avbruten = $false

Write-Host ""
Write-Host "Öppnar $total sajter, en i taget. Signera med BankID eller fyll i formuläret själv på varje."

for ($i = 0; $i -lt $total; $i++) {
    $s = $sajter[$i]
    $gjorda = $i + 1
    Write-Host ""
    Write-Host "[$($i + 1)/$total] $($s.namn)" -ForegroundColor Cyan
    Write-Host "  $($s.steg)"
    Write-Host "  $($s.url)" -ForegroundColor DarkGray
    try {
        Start-Process $s.url
    } catch {
        Write-Host "  (Kunde inte öppna webbläsaren. Öppna länken ovan själv.)"
    }
    if ($i -lt $total - 1) {
        $svar = Read-Host "  Enter = nästa sajt, a = avsluta"
        if ($svar -eq 'a') {
            $avbruten = $true
            break
        }
    }
}

Write-Host ""
if ($avbruten) {
    Write-Host "Avbrutet efter $gjorda av $total sajter. $($total - $gjorda) återstår."
} else {
    Write-Host "Alla $total sajter genomgångna. Sök på ditt namn om en vecka och kolla att du är borta."
}
Write-Host "Står du kvar: se ""Står du kvar, eller saknar du BankID?"" i README.md."
