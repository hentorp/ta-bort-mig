import open from 'open';
import chalk from 'chalk';

// Öppnar en webbsida eller ett mejlutkast. Med dryRun skrivs bara vad som skulle öppnas.
export async function openUrl(url, { dryRun = false } = {}) {
  if (dryRun) {
    console.log(chalk.gray(`  [dry-run] öppnar ${url}`));
    return;
  }
  await open(url);
}

export async function openMail({ to, subject, body }, { dryRun = false } = {}) {
  if (dryRun) {
    console.log(chalk.gray(`  [dry-run] mejl till ${to}\n  Ämne: ${subject}\n`));
    console.log(body.replace(/^/gm, '  │ '));
    return;
  }
  await open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}
