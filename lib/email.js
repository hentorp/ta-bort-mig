// Mejlmallar. Inga ID-bilagor eller personnummer som standard: art. 12.6 låter bolaget
// begära mer bara vid rimliga tvivel om vem du är, och då kan du svara på det mejlet.

export const fmtDate = (d) => new Date(d).toLocaleDateString('sv-SE');

function identity(config, profileUrl) {
  const lines = [`Namn: ${config.name}`];
  const city = [config.postalCode, config.city].filter(Boolean).join(' ');
  const addr = [config.address, city].filter(Boolean).join(', ');
  if (addr) lines.push(`Adress: ${addr}`);
  if (config.birthYear) lines.push(`Födelseår: ${config.birthYear}`);
  if (config.phone) lines.push(`Telefon: ${config.phone}`);
  if (profileUrl) lines.push(`Profil: ${profileUrl}`);
  return lines.join('\n');
}

// Formulerat så att det stämmer även för tjänster IMY inte har prövat: besluten gäller
// de fyra granskade bolagen och är enligt IMY vägledande för andra.
function legalBasis(svc) {
  const general =
    'EU-domstolen slog den 9 juli 2026 fast att ett utgivningsbevis inte i sig avgör om ' +
    'dataskyddsförordningen gäller. Integritetsskyddsmyndigheten (IMY) fann därefter den ' +
    '3 november 2026 att de svenska undantagen för söktjänster med frivilligt utgivningsbevis ' +
    'går längre än EU-rätten medger, och att sådana söktjänster ska tillämpa rätten till radering.';
  if (svc.imyDecision && svc.company) {
    return `${general} IMY riktade samtidigt en reprimand mot ${svc.company} för att begäranden om radering inte hade tillgodosetts.`;
  }
  return general;
}

export function removalRequest(config, svc, profileUrl) {
  return {
    to: svc.email,
    subject: `Begäran om radering enligt artikel 17 GDPR – ${config.name}`,
    body: `Hej,

Jag begär att ni raderar min profil och samtliga personuppgifter om mig i ${svc.name}, med stöd av artikel 17 i dataskyddsförordningen (GDPR).

${legalBasis(svc)}

Uppgifter för att identifiera mig:
${identity(config, profileUrl)}

Enligt artikel 12.3 ska ni besvara begäran utan onödigt dröjsmål och senast inom en månad. Om ni inte raderar uppgifterna ber jag om skälen till det. Får jag inget svar kommer jag att lämna in ett klagomål till IMY.

Behöver ni fler uppgifter för att bekräfta min identitet går det bra att svara på det här mejlet.

Med vänliga hälsningar,
${config.name}`,
  };
}

export function followUp(config, svc, entry) {
  const sent = entry?.requestedAt ? ` den ${fmtDate(entry.requestedAt)}` : '';
  return {
    to: svc.email,
    subject: `Ang. begäran om radering enligt artikel 17 GDPR – ${config.name}`,
    body: `Hej,

Jag har fått ert svar på min begäran om radering${sent}. Jag vidhåller begäran.

${legalBasis(svc)} Att ${svc.name} har utgivningsbevis är alltså inte i sig ett skäl att neka radering.

Jag ber er radera mina uppgifter och bekräfta det, eller redovisa vilket undantag i artikel 17.3 ni stöder er på. Annars lämnar jag in ett klagomål till IMY.

${identity(config)}

Med vänliga hälsningar,
${config.name}`,
  };
}

// Text att klistra in i IMY:s e-tjänst. IMY kräver att den ansvarige kan identifieras.
export function complaint(config, svc, entry) {
  const company = svc.company ?? '[BOLAGSNAMN — står i sajtens integritetspolicy]';
  const sent = entry?.requestedAt ? fmtDate(entry.requestedAt) : '[DATUM]';
  const outcome =
    entry?.status === 'refused'
      ? `Bolaget nekade begäran${entry.refusedAt ? ` den ${fmtDate(entry.refusedAt)}` : ''}, och har inte raderat uppgifterna efter min påminnelse.`
      : 'Jag har inte fått något svar inom den månad som artikel 12.3 föreskriver, och uppgifterna finns kvar.';
  return `Klagomål: rätten till radering (artikel 17 GDPR)

Personuppgiftsansvarig: ${company}
Tjänst: ${svc.name}

Den ${sent} begärde jag att ${company} skulle radera mina personuppgifter i söktjänsten ${svc.name} med stöd av artikel 17. Begäran skickades till ${svc.email}.

${outcome}

IMY har i beslut den 3 november 2026 funnit att söktjänster med frivilligt utgivningsbevis ska tillämpa rätten till radering${svc.imyDecision ? `, och riktade då en reprimand mot ${company} för just detta` : ''}.

Jag kan skicka kopior av min begäran${entry?.status === 'refused' ? ' och bolagets svar' : ''}.

${identity(config)}
`;
}
