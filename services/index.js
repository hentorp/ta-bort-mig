// Söktjänsterna som data. Källor (kontrollerade 2026-11-20): IMY:s beslut 3 nov 2026,
// aka.se (uppdaterad 14 nov 2026) och r/sweden-tråden 1xxy3xx. Mejladresser som bara
// kommer från tråden är markerade med `emailSource: 'reddit'`.
//
// `company` är personuppgiftsansvarig, som IMY kräver i ett klagomål. Fylls bara i när
// en primärkälla anger bolaget — annars får användaren slå upp det i sajtens integritetspolicy.
// `imyDecision` = IMY har prövat just den här tjänsten (beslut 2026-11-03).

const q = (s) => encodeURIComponent(s);
const splitName = (name) => {
  const [first, ...rest] = name.trim().split(/\s+/);
  return { first, last: rest.join(' ') };
};

export const SERVICES = [
  {
    id: 'ratsit',
    name: 'Ratsit',
    home: 'https://www.ratsit.se/',
    company: null,
    bankid: {
      url: 'https://www.ratsit.se/tabort',
      steps: ['Logga in med BankID', 'Bekräfta borttagningen (ska slå igenom inom 24 timmar)'],
    },
    email: 'kundservice@ratsit.se',
    search: (c) => {
      const { first, last } = splitName(c.name);
      return `https://www.ratsit.se/sok/person?fornamn=${q(first)}&efternamn=${q(last)}&ort=`;
    },
    notes: ['Har gamla autosvar om att grundlagen går före GDPR — svara med `nekad ratsit`.'],
  },
  {
    id: 'mrkoll',
    name: 'MrKoll',
    home: 'https://mrkoll.se/',
    company: 'Nusvar AB',
    imyDecision: true,
    bankid: {
      url: 'https://mrkoll.se/om/ta-bort/',
      steps: ['Klicka "Starta BankID och ta bort mig"', 'Signera med BankID'],
    },
    email: 'hej@nusvar.se',
    emailSource: 'reddit',
    notes: [
      'Ibland döljs bara gatuadressen medan namn och postnummer står kvar.',
      'Kontrollera med `kolla` efter en vecka — står profilen kvar, kör `mejla mrkoll`.',
    ],
  },
  {
    id: 'hitta',
    name: 'Hitta.se',
    home: 'https://www.hitta.se/',
    company: null,
    bankid: {
      url: 'https://www.hitta.se/kontakta-oss/ta-bort-kontaktsida',
      steps: ['Sök fram dig själv', 'Klicka "Ta bort"', 'Signera med BankID'],
    },
    email: 'kundservice@hitta.se',
    notes: ['Numret kan publiceras igen om det inte är hemligt hos din operatör.'],
  },
  {
    id: 'merinfo',
    name: 'Merinfo',
    home: 'https://www.merinfo.se/',
    company: null,
    bankid: {
      url: 'https://www.merinfo.se/ta-bort-mina-uppgifter',
      steps: [
        'Kryssa i rutan och logga in med BankID',
        'Välj "Radera min profil helt" — INTE "Justera min synlighet" (döljer bara delar)',
      ],
    },
    email: 'info@merinfo.se',
    search: (c) => `https://www.merinfo.se/search?d=p&query=${q(c.name)}`,
    notes: ['Kan fortfarande visa dig som "granne" på andras profiler efter borttagning.'],
  },
  {
    id: 'eniro',
    name: 'Eniro',
    home: 'https://www.eniro.se/',
    company: null,
    bankid: {
      url: 'https://uppdatera.eniro.se/person',
      steps: ['Sök ditt namn och logga in med BankID', 'Välj "Dölj mig" (går inte att ångra)'],
    },
    email: 'privatpersoner@eniro.com',
    emailSource: 'reddit',
    notes: ['Numret kan publiceras igen om det inte är hemligt hos din operatör.'],
  },
  {
    id: 'birthday',
    name: 'Birthday.se',
    home: 'https://www.birthday.se/',
    company: null,
    // Ingen egen BankID-sida: man mejlar och får en BankID-länk tillbaka.
    bankid: null,
    email: 'info@birthday.se',
    infoUrl: 'https://www.birthday.se/personuppgifter',
    notes: ['Mejla — du ska få en länk tillbaka för att ta bort dig med BankID.'],
  },
  {
    id: 'upplysning',
    name: 'Upplysning.se',
    home: 'https://www.upplysning.se/',
    company: 'Upplysning Checknode AB',
    imyDecision: true,
    bankid: {
      url: 'https://selfservice.upplysning.se/',
      steps: ['Logga in med BankID i självserviceportalen', 'Begär radering'],
    },
    email: 'info@upplysning.se',
    emailSource: 'reddit',
    notes: ['Sökningen har varit pausad sedan 20 aug 2026 — begär radering ändå.'],
  },
];

// Extra skydd som inte är borttagningar men minskar exponeringen.
export const EXTRAS = [
  {
    name: 'Skatteverket — spärr mot obehörig adressändring',
    url: 'https://www.skatteverket.se/privat/folkbokforing/adressandring/sparraobehorigadressandring.4.76a43be412206334b89800017188.html',
    steps: ['Logga in med BankID', 'Aktivera spärren'],
  },
  {
    name: 'Adresslåset (adressandring.se)',
    url: 'https://www.adressandring.se/adresslasetnew/',
    steps: ['Lås din adress med BankID', 'Framtida adressändringar kräver då BankID'],
  },
  {
    name: 'Google — gamla träffar',
    url: 'https://reportcontent.google.com/forms/rtbf',
    steps: [
      'När sajterna har tagit bort dig: googla ditt namn',
      'Tre prickarna vid en gammal träff → "Ta bort resultat"',
      'Gäller bara Google — Bing, Brave m.fl. har egna formulär',
    ],
  },
  {
    name: '180.se',
    url: 'https://www.180.se/kontakta',
    steps: ['Be dem blockera ditt telefonnummer'],
  },
];

export const byId = (id) => SERVICES.find((s) => s.id === id);
