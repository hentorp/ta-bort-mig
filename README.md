# Ta bort dig från Ratsit, MrKoll, Hitta och de andra

Sju svenska sajter visar din adress, ålder och dina grannar för vem som helst. I dag kan
du ta bort dig från nästan alla med BankID. Det tar ungefär tio minuter och kostar
ingenting.

*Länkarna kontrollerades senast 20 november 2026.*

## Välj ett sätt

1. **[Klicka själv](#sajterna)**: gå igenom tabellen nedan.
2. **[Kör skriptet](#skriptet)**: det öppnar sidorna åt dig, en i taget.
3. **[Låt en AI-agent guida dig](#med-en-ai-agent)**: peka Claude Code, Codex, Cursor
   eller en liknande agent mot repot.

Oavsett vilket sätt du väljer signerar du själv med BankID. Ingen kan göra det åt dig,
och det är meningen.

## Sajterna

| # | Sajt | Gör så här |
|---|------|------------|
| 1 | [**Ratsit**](https://www.ratsit.se/tabort) | Identifiera dig med BankID. Det kan ta upp till 24 timmar innan du är borta. |
| 2 | [**MrKoll**](https://mrkoll.se/om/ta-bort/) | Klicka *Starta BankID och ta bort mig* och signera. |
| 3 | [**Hitta.se**](https://www.hitta.se/kontakta-oss/ta-bort-kontaktsida) | Sök fram dig själv, klicka *Ta bort* och signera med BankID. |
| 4 | [**Merinfo**](https://www.merinfo.se/ta-bort-mina-uppgifter) | Klicka *Gå vidare*, logga in med BankID och välj **Radera min profil helt**. *Justera min synlighet* döljer bara delar av profilen. |
| 5 | [**Eniro**](https://uppdatera.eniro.se/person) | Sök på ditt namn, logga in med BankID och välj *Dölj mig*. |
| 6 | **Birthday.se** | Har ingen BankID-sida. Mejla [info@birthday.se](mailto:info@birthday.se?subject=Radera%20mina%20personuppgifter) och be dem radera dina uppgifter. Skriv ditt namn och din adress så att de hittar rätt person. Använd gärna [mallen](#mejlmall). |
| 7 | [**Upplysning.se**](https://selfservice.upplysning.se/) | Sökningen är pausad sedan augusti 2026, och de uppger att de bara behandlar uppgifter om medlemmar. Logga in med BankID om du vill kontrollera. |

## Skriptet

Skriptet öppnar sidorna i din vanliga webbläsare, en i taget, och visar vad du ska göra
på varje. Det skickar inget och sparar inget, och du behöver inte installera något.

Ladda ner repot med den gröna knappen **Code → Download ZIP** och packa upp det, eller
klona det:

```bash
git clone https://github.com/hentorp/ta-bort-mig.git
```

Öppna sedan en terminal i mappen.

**macOS och Linux**

```bash
bash oppna-sidorna.sh
```

**Windows** (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File .\oppna-sidorna.ps1
```

## Med en AI-agent

Öppna mappen i din agent och skriv till exempel:

> Hjälp mig ta bort mig från söktjänsterna.

Agenten följer [AGENTS.md](AGENTS.md). Den öppnar en sida i taget och väntar medan du
signerar. Den klickar aldrig på BankID-knappar åt dig och ber aldrig om ditt personnummer
eller en bild på din legitimation. Gör den det ändå, avbryt.

Agenter som kan styra en webbläsare kan också få länken till repot direkt:
`https://github.com/hentorp/ta-bort-mig`.

## Efteråt

- **Vänta en vecka** och sök sedan på ditt namn på varje sajt. Kör gärna skriptet igen.
- **MrKoll** döljer ibland bara gatuadressen och låter namn och postnummer stå kvar. Står
  du kvar, [mejla dem](#står-du-kvar-eller-saknar-du-bankid).
- **Gör ditt telefonnummer hemligt** hos din operatör. Annars kan Hitta och Eniro
  publicera det igen.
- **Merinfo** kan fortfarande visa dig som granne på andras profiler.
- **Google**: när sajterna har tagit bort dig kan gamla sökträffar ligga kvar ett tag.
  Klicka på de tre prickarna vid träffen och välj *Ta bort resultat*. Bing och andra
  sökmotorer har egna formulär.

## Står du kvar, eller saknar du BankID?

Då mejlar du en begäran om radering. Sajten ska svara inom en månad
([artikel 12.3 i GDPR](https://eur-lex.europa.eu/legal-content/SV/TXT/?uri=CELEX:32016R0679)).

| Sajt | Mejl |
|------|------|
| Ratsit | kundservice@ratsit.se |
| MrKoll | hej@nusvar.se |
| Hitta.se | kundservice@hitta.se |
| Merinfo | info@merinfo.se |
| Eniro | privatpersoner@eniro.com |
| Birthday.se | info@birthday.se |
| Upplysning.se | info@upplysning.se |

Adresserna kommer från sajterna själva och från andra guider. Om ett mejl studsar, leta
upp rätt adress på sajtens kontaktsida.

**Skicka helst ingen bild på ditt pass eller ID-kort.** Sajten får bara be om mer
information om den har rimliga tvivel om vem du är (artikel 12.6 i GDPR). Ber de om det,
fråga varför.

### Mejlmall

```text
Ämne: Begäran om radering enligt artikel 17 GDPR

Hej,

Jag begär att ni raderar min profil och alla personuppgifter om mig i er söktjänst,
med stöd av artikel 17 i dataskyddsförordningen (GDPR).

Integritetsskyddsmyndigheten (IMY) beslutade den 3 november 2026 att söktjänster med
frivilligt utgivningsbevis ska tillämpa rätten till radering.

Namn: [ditt namn]
Adress: [gata, postnummer, ort]
Födelseår: [år]

Svara gärna när uppgifterna är borttagna, senast inom en månad.

Med vänliga hälsningar,
[ditt namn]
```

Om sajten svarar att grundlagen går före GDPR, hänvisa till IMY:s beslut. Om du inte får
svar inom en månad kan du
[lämna ett klagomål till IMY](https://www.imy.se/privatperson/utfora-arenden/lamna-ett-klagomal/).

## Mer skydd

- [Spärra obehörig adressändring](https://www.skatteverket.se/privat/folkbokforing/adressandring/sparraobehorigadressandring.4.76a43be412206334b89800017188.html)
  hos Skatteverket.
- [Adresslåset](https://www.adressandring.se/adresslasetnew/) gör att adressändringar
  kräver BankID.

## Varför går det nu?

- **9 juli 2026**: EU-domstolen slog fast att ett utgivningsbevis inte i sig gör en
  persondatabas till journalistik. GDPR kan alltså gälla.
- **3 november 2026**: [IMY beslutade](https://www.imy.se/nyheter/soktjanster-behandlar-personuppgifter-pa-otillatet-satt/)
  att MrKoll och Upplysning har brustit i rätten till radering. Enligt IMY gäller besluten
  de granskade bolagen men
  [kan vara vägledande](https://www.imy.se/privatperson/dataskydd/imys-granskningar-av-soktjanster-ar-avslutade/)
  för andra sajter som Ratsit, Hitta och Eniro.

Grundlagen har inte ändrats, men de flesta sajterna erbjuder i dag borttagning med BankID.

## Säkerhet

- Signera bara med BankID när du själv har öppnat sidan, och när BankID-appen visar
  sajtens namn.
- Ingen seriös sajt ringer upp dig och ber dig signera.
- Repot innehåller inga personuppgifter och skickar inget någonstans.

## Hittat en trasig länk?

Öppna ett issue eller skicka en pull request. Alla länkar och steg finns i
[`sajter.tsv`](sajter.tsv). Ändrar du den, uppdatera tabellen ovan också.

Innehållet är fritt att använda och kopiera ([CC0](LICENSE)).

---

**In English:** every link in the table opens the site's own BankID removal page. You
need a Swedish BankID. Run `bash oppna-sidorna.sh` to open the pages one by one, or point
an AI agent at this repo; it follows [AGENTS.md](AGENTS.md).
