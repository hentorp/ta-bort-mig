import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const STATE_FILE = 'state.json';

// IMY:s beslut om rätten till radering hos söktjänster med utgivningsbevis.
export const RULING_DATE = new Date('2026-11-03');

// Status per tjänst:
//   (saknas)    att göra
//   requested   mejl skickat, väntar på svar — fristen löper
//   done        borttagen (BankID eller bekräftat via mejl)
//   refused     nekad eller autosvar om grundlagsskydd
//   complained  klagomål inlämnat till IMY
export const STATUSES = ['requested', 'done', 'refused', 'complained'];

// Tidigare versioner sparade { status, lastRun, lastRemoval, profileUrl } med
// statusar som removal_initiated/not_found. De begärandena gjordes före IMY:s
// beslut, så de räknas inte — tjänsten blir "att göra" och den gamla posten sparas.
function migrate(entry) {
  if (!entry || entry.legacy || STATUSES.includes(entry.status) || !entry.lastRun) return entry;
  return {
    legacy: {
      status: entry.status,
      date: entry.lastRemoval ?? entry.lastRun,
      ...(entry.profileUrl ? { profileUrl: entry.profileUrl } : {}),
    },
  };
}

export async function readState() {
  if (!existsSync(STATE_FILE)) return {};
  const raw = JSON.parse(await readFile(STATE_FILE, 'utf8'));
  return Object.fromEntries(Object.entries(raw).map(([id, e]) => [id, migrate(e)]));
}

async function writeState(state) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

export async function update(id, fields) {
  const state = await readState();
  state[id] = { ...(state[id] ?? {}), ...fields };
  await writeState(state);
  return state[id];
}

// GDPR art. 12.3: svar senast en månad efter att begäran kommit in.
export function deadline(entry) {
  if (entry?.status !== 'requested' || !entry.requestedAt) return null;
  const d = new Date(entry.requestedAt);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export function isOverdue(entry, now = new Date()) {
  const d = deadline(entry);
  return d !== null && now > d;
}
