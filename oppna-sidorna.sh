#!/usr/bin/env bash
# Öppnar borttagningssidorna i sajter.tsv i din webbläsare, en i taget.
# Skriptet skickar inget och sparar inget. Du signerar själv med BankID.
set -euo pipefail
cd "$(dirname "$0")"

if [ -n "${BROWSER:-}" ]; then
  open_url() { "$BROWSER" "$1"; }
elif command -v wslview >/dev/null 2>&1; then
  open_url() { wslview "$1"; }
elif [ "$(uname -s)" = Darwin ]; then
  open_url() { open "$1"; }
elif command -v xdg-open >/dev/null 2>&1; then
  open_url() { xdg-open "$1"; }
else
  open_url() { return 1; }
fi

total=$(( $(grep -c . sajter.tsv) - 1 ))
i=0

echo
echo "Öppnar $total sajter, en i taget. Signera själv med BankID på varje."

while IFS=$'\t' read -r namn url steg <&3; do
  i=$((i + 1))
  printf '\n[%d/%d] %s\n  %s\n  %s\n' "$i" "$total" "$namn" "$steg" "$url"
  open_url "$url" >/dev/null 2>&1 || echo "  (Kunde inte öppna webbläsaren. Öppna länken ovan själv.)"
  if [ "$i" -lt "$total" ]; then
    read -r -p "  Enter = nästa sajt, a = avsluta: " svar || svar=a
    if [ "$svar" = a ]; then break; fi
  fi
done 3< <(tail -n +2 sajter.tsv)

echo
echo "Klart. Sök på ditt namn på sajterna om en vecka och kolla att du är borta."
echo "Står du kvar: se \"Står du kvar, eller saknar du BankID?\" i README.md."
