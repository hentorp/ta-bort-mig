# Öppnar borttagningssidorna i sajter.tsv i din webbläsare, en i taget.
# Skriptet skickar inget och sparar inget. Du signerar själv med BankID.
# Kör: powershell -ExecutionPolicy Bypass -File .\oppna-sidorna.ps1

$sajter = @(Import-Csv -Path (Join-Path $PSScriptRoot 'sajter.tsv') -Delimiter "`t" -Encoding UTF8)
$total = $sajter.Count

Write-Host ""
Write-Host "Öppnar $total sajter, en i taget. Signera själv med BankID på varje."

for ($i = 0; $i -lt $total; $i++) {
    $s = $sajter[$i]
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
        if ($svar -eq 'a') { break }
    }
}

Write-Host ""
Write-Host "Klart. Sök på ditt namn på sajterna om en vecka och kolla att du är borta."
Write-Host "Står du kvar: se ""Står du kvar, eller saknar du BankID?"" i README.md."
