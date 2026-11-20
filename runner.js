#!/usr/bin/env node
// auto-anonym — BankID-checklista och fristbevakning för svenska söktjänster.
//
// Själva borttagningen kräver att du signerar med BankID och går inte att automatisera.
// Verktyget öppnar rätt sidor i rätt ordning, skickar raderingsmejl där BankID saknas,
// håller koll på GDPR:s enmånadsfrist och tar fram klagomålstext till IMY.

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createInterface } from 'readline';
import chalk from 'chalk';
import { SERVICES, EXTRAS, byId } from './services/index.js';
import { readState, update, deadline, isOverdue, RULING_DATE } from './lib/state.js';
import { removalRequest, followUp, complaint, fmtDate } from './lib/email.js';
import { openUrl, openMail } from './lib/launch.js';

const IMY_COMPLAINT_URL = 'https://www.imy.se/privatperson/utfora-arenden/lamna-ett-klagomal/';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const [cmd = 'start', id] = argv.filter((a) => !a.startsWith('--'));
const dryRun = flags.has('--dry-run');
const force = flags.has('--force');

const LABEL = {
  requested: chalk.cyan('väntar på svar'),
  done: chalk.green('borttagen'),
  refused: chalk.red('nekad'),
  complained: chalk.magenta('anmäld till IMY'),
};
const now = () => new Date().toISOString();

// ── hjälpare ────────────────────────────────────────────────────────────────

async function loadConfig() {
  if (!existsSync('config.json')) {
    console.error(chalk.red('config.json saknas — kör: npm run setup'));
    process.exit(1);
  }
  return JSON.parse(await readFile('config.json', 'utf8'));
}

function requireService(serviceId) {
  const svc = byId(serviceId);
  if (!svc) {
    console.error(chalk.red(serviceId ? `Okänd tjänst: ${serviceId}` : 'Ange en tjänst.'));
    console.error(`Tjänster: ${SERVICES.map((s) => s.id).join(', ')}`);
    process.exit(1);
  }
  return svc;
}

// Läser rader via en asynkron iterator så att det fungerar även med inmatning via pipe.
function prompter() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();
  return {
    async ask(question) {
      process.stdout.write(question);
      const { value, done } = await lines.next();
      if (done) return null;
      return value.trim().toLowerCase();
    },
    close: () => rl.close(),
  };
}

const LEGACY_LABEL = { removal_initiated: 'mejl skickat', not_found: 'ej hittad', found: 'hittad', error: 'fel' };

function legacyNote(entry) {
  if (!entry?.legacy) return null;
  const { date, status: old } = entry.legacy;
  const what = `tidigare körning ${fmtDate(date)}: ${LEGACY_LABEL[old] ?? old}`;
  return new Date(date) < RULING_DATE ? `${what} (före IMY:s beslut 3 nov — gör om)` : what;
}

function statusLine(entry) {
  if (!entry?.status) return chalk.gray('att göra');
  let s = LABEL[entry.status];
  const d = deadline(entry);
  if (d) s += isOverdue(entry) ? chalk.red(` — frist gick ut ${fmtDate(d)}`) : chalk.gray(` — frist ${fmtDate(d)}`);
  return s;
}

// ── kommandon ───────────────────────────────────────────────────────────────

async function sendRemoval(svc, config, state) {
  const profileUrl = state[svc.id]?.legacy?.profileUrl;
  await openMail(removalRequest(config, svc, profileUrl), { dryRun });
  if (dryRun) return;
  await update(svc.id, { status: 'requested', method: 'email', requestedAt: now() });
  console.log(chalk.cyan(`  Mejlutkast öppnat till ${svc.email}. Skicka det — fristen räknas från idag.`));
  if (svc.emailSource === 'reddit') {
    console.log(chalk.gray('  (Adressen kommer från r/sweden-tråden. Studsar mejlet: se sajtens kontaktsida.)'));
  }
}

async function start() {
  const config = await loadConfig();
  const state = await readState();
  const p = prompter();

  console.log(chalk.bold('\nGenomgång — BankID först, mejl där det saknas.'));
  console.log(chalk.gray('Varje sida öppnas i din webbläsare. Signera själv med BankID.\n'));

  try {
    for (const svc of SERVICES) {
      const entry = state[svc.id];
      const head = chalk.bold(`[${svc.name}]`);

      if (entry?.status) {
        console.log(`${head} ${statusLine(entry)}`);
        continue;
      }

      console.log(`\n${head}`);
      const legacy = legacyNote(entry);
      if (legacy) console.log(chalk.yellow(`  ${legacy}`));
      for (const n of svc.notes ?? []) console.log(chalk.gray(`  • ${n}`));

      let choices;
      if (svc.bankid) {
        svc.bankid.steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
        await openUrl(svc.bankid.url, { dryRun });
        console.log(chalk.gray(`  ${svc.bankid.url}`));
        choices = '[k]lar  [m]ejla i stället  [h]oppa över  [a]vsluta: ';
      } else {
        choices = '[m]ejla  [h]oppa över  [a]vsluta: ';
      }

      const answer = await p.ask(`  ${choices}`);
      if (answer === null || answer === 'a') break;
      if (answer === 'k' && svc.bankid) {
        if (dryRun) console.log(chalk.gray('  [dry-run] skulle markeras som borttagen'));
        else {
          await update(svc.id, { status: 'done', method: 'bankid', doneAt: now() });
          console.log(chalk.green('  Markerad som borttagen.'));
        }
      } else if (answer === 'm') {
        await sendRemoval(svc, config, state);
      } else {
        console.log(chalk.gray('  Hoppar över.'));
      }
    }
  } finally {
    p.close();
  }

  console.log(`\nKör ${chalk.cyan('npm run status')} för frister, ${chalk.cyan('node runner.js kolla')} om en vecka`);
  console.log(`för att se att du är borta, och ${chalk.cyan('node runner.js extra')} för fler skydd.\n`);
}

async function status() {
  const state = await readState();
  console.log('\n' + chalk.bold('Status per tjänst'));
  console.log('─'.repeat(72));
  const todo = [];
  for (const svc of SERVICES) {
    const entry = state[svc.id];
    const via = entry?.method ? chalk.gray(` (${entry.method === 'bankid' ? 'BankID' : 'mejl'})`) : '';
    console.log(`  ${svc.name.padEnd(16)} ${statusLine(entry)}${via}`);
    const legacy = legacyNote(entry);
    if (legacy && !entry.status) console.log(chalk.yellow(`  ${''.padEnd(16)} ${legacy}`));

    if (isOverdue(entry)) todo.push(`node runner.js imy ${svc.id}`);
    else if (entry?.status === 'refused') todo.push(`node runner.js imy ${svc.id}   (om påminnelsen inte hjälpt)`);
  }
  console.log('─'.repeat(72));
  if (todo.length) {
    console.log(chalk.bold('Nästa steg:'));
    todo.forEach((t) => console.log(`  ${chalk.cyan(t)}`));
  }
  console.log();
}

async function mejla() {
  const svc = requireService(id);
  const [config, state] = await Promise.all([loadConfig(), readState()]);
  console.log(chalk.bold(`\n[${svc.name}]`));
  await sendRemoval(svc, config, state);
  console.log();
}

async function klar() {
  const svc = requireService(id);
  await update(svc.id, { status: 'done', doneAt: now() });
  console.log(chalk.green(`${svc.name} markerad som borttagen.`));
}

async function nekad() {
  const svc = requireService(id);
  const [config, state] = await Promise.all([loadConfig(), readState()]);
  await openMail(followUp(config, svc, state[svc.id]), { dryRun });
  if (!dryRun) await update(svc.id, { status: 'refused', refusedAt: now() });
  console.log(chalk.yellow(`\n${svc.name} markerad som nekad. Påminnelse öppnad i mejlprogrammet.`));
  console.log(`Ger de sig inte: ${chalk.cyan(`node runner.js imy ${svc.id}`)}\n`);
}

async function imy() {
  const svc = requireService(id);
  const [config, state] = await Promise.all([loadConfig(), readState()]);
  const entry = state[svc.id];

  if (!force) {
    if (!entry?.status) {
      console.error(chalk.yellow(`Du har inte begärt radering hos ${svc.name} än. Kör först: node runner.js mejla ${svc.id}`));
      console.error(chalk.gray('IMY vill att du kontaktar bolaget först. --force kör ändå.'));
      process.exit(1);
    }
    if (entry.status === 'requested' && !isOverdue(entry)) {
      console.error(chalk.yellow(`Fristen hos ${svc.name} går ut ${fmtDate(deadline(entry))}. Vänta tills dess (--force kör ändå).`));
      process.exit(1);
    }
  }

  const text = complaint(config, svc, entry);
  const file = `klagomal/${svc.id}-${fmtDate(new Date())}.txt`;
  if (!dryRun) {
    await mkdir('klagomal', { recursive: true });
    await writeFile(file, text);
  }
  console.log('\n' + text.replace(/^/gm, '  │ '));
  if (!dryRun) console.log(chalk.gray(`  Sparad i ${file}`));
  if (!svc.company) console.log(chalk.yellow('  Fyll i bolagsnamnet — IMY kräver att den ansvarige kan identifieras.'));
  console.log(chalk.gray('  Har du skyddade personuppgifter: skicka brev i stället för att använda e-tjänsten.'));
  console.log(chalk.gray('  Bifoga din begäran och bolagets svar.\n'));
  await openUrl(IMY_COMPLAINT_URL, { dryRun });
  if (dryRun) return;

  const p = prompter();
  const answer = await p.ask('  Skickade du in klagomålet? [j/n]: ');
  p.close();
  if (answer === 'j') {
    await update(svc.id, { status: 'complained', complainedAt: now() });
    console.log(chalk.magenta(`  ${svc.name} markerad som anmäld till IMY.\n`));
  }
}

async function kolla() {
  const config = await loadConfig();
  const state = await readState();
  const targets = id
    ? [requireService(id)]
    : SERVICES.filter((s) => ['done', 'requested', 'complained'].includes(state[s.id]?.status));
  if (!targets.length) {
    console.log('Inget att kontrollera än — kör genomgången först (npm start), eller ange en tjänst.');
    return;
  }
  console.log(chalk.bold('\nÖppnar sökningar. Står du kvar efter en vecka: node runner.js mejla <tjänst>\n'));
  for (const svc of targets) {
    const url = svc.search ? svc.search(config) : svc.home;
    console.log(`  ${svc.name.padEnd(16)} ${svc.search ? '' : chalk.gray('(sök på ditt namn) ')}${chalk.gray(url)}`);
    await openUrl(url, { dryRun });
  }
  console.log();
}

function extra() {
  console.log(chalk.bold('\nExtra skydd\n'));
  for (const e of EXTRAS) {
    console.log(chalk.bold(`  ${e.name}`));
    e.steps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
    console.log(chalk.gray(`    ${e.url}\n`));
  }
}

function help() {
  console.log(`
${chalk.bold('auto-anonym')} — ta bort dig från svenska söktjänster

  npm start                    genomgång: öppnar BankID-sidorna en i taget
  npm run status               status och frister per tjänst
  node runner.js mejla <id>    raderingsmejl (art. 17) — startar enmånadsfristen
  node runner.js klar <id>     markera som borttagen (t.ex. efter bekräftelsemejl)
  node runner.js nekad <id>    de sa nej → markera och öppna påminnelsemejl
  node runner.js imy <id>      klagomålstext till IMY + öppna e-tjänsten
  node runner.js kolla [id]    öppna sökningar för att se om du ligger kvar
  node runner.js extra         Skatteverket, Adresslåset, Google m.m.

  --dry-run   öppna inget, skriv ut vad som skulle hända
  --force     kör imy även innan fristen gått ut

  Tjänster: ${SERVICES.map((s) => s.id).join(', ')}
`);
}

const COMMANDS = { start, status, mejla, klar, nekad, imy, kolla, extra, hjälp: help, help };
const run = flags.has('--status') ? status : COMMANDS[cmd];
if (!run) {
  console.error(chalk.red(`Okänt kommando: ${cmd}`));
  help();
  process.exit(1);
}
Promise.resolve(run()).catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
