// What each design-system component is for, one line each, so a builder names the existing component for a job before
// building a new one (briefs/build.md §1a, Parts). Reads the first sentence of each ux/design-system/components/<Name>/README.md.
// Usage: node scripts/component-jobs.mjs [word]   (a word filters to components whose line mentions it, e.g. history)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ux/design-system/components');
const word = (process.argv[2] || '').toLowerCase();
for (const name of fs.readdirSync(dir).sort()) {
  const readme = path.join(dir, name, 'README.md');
  if (!/^[A-Z]/.test(name) || !fs.existsSync(readme)) continue;
  const line = fs.readFileSync(readme, 'utf8').split(/\r?\n/).map((l) => l.trim())
    .filter((l) => l && !/^[#>|`!-]/.test(l));
  // a status line (**Status: candidate.** Extracted from …) is history, not the job: prefer the first plain sentence
  const plain = line.find((l) => !l.startsWith('**')) || line[0] || '';
  const status = (line.find((l) => /^\*\*(Status|Classification)/.test(l)) || '').match(/\*\*(?:Status|Classification): ([^.*]+)/);
  const job = plain.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').split(/(?<=\.)\s/)[0];
  if (!word || (name + ' ' + job).toLowerCase().includes(word)) console.log(`${name.padEnd(16)} ${job}${status ? ` [${status[1].trim()}]` : ''}`);
}
