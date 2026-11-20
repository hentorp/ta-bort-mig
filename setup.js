#!/usr/bin/env node
import { createInterface } from 'readline';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

const CONFIG_FILE = 'config.json';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('\nauto-anonym — konfigurationsguide\n');
  console.log('Dina uppgifter sparas lokalt i config.json (gitignored).\n');

  let existing = {};
  if (existsSync(CONFIG_FILE)) {
    existing = JSON.parse(await readFile(CONFIG_FILE, 'utf8'));
    console.log('Befintlig config hittad. Tryck ENTER för att behålla nuvarande värde.\n');
  }

  const prompt = (label, key, placeholder = '') => {
    const current = existing[key] ? ` [${existing[key]}]` : placeholder ? ` (${placeholder})` : '';
    return ask(`${label}${current}: `).then((v) => v.trim() || existing[key] || '');
  };

  const name = await prompt('Fullständigt namn', 'name', 'Förnamn Efternamn');
  const address = await prompt('Gatuadress', 'address', 'Gatan 1');
  const postalCode = await prompt('Postnummer', 'postalCode', '123 45');
  const city = await prompt('Ort', 'city', 'Stockholm');
  const phone = await prompt('Telefonnummer', 'phone', '070-123 45 67');
  const birthYear = await prompt('Födelseår', 'birthYear', '1985');
  const config = {
    name,
    address,
    postalCode,
    city,
    phone,
    birthYear,
  };

  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`\nConfig sparad till ${CONFIG_FILE}`);
  // Nollställ bara status om det är en annan person — inte vid t.ex. ny adress.
  if (existing.name && existing.name !== name) {
    await writeFile('state.json', '{}');
    console.log('Status nollställd (ny person).');
  }
  console.log('Kör nu: npm start\n');
  rl.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
