// Prints the CHANGELOG.md section for a version, for the GitHub Release.
// Usage: node scripts/release-notes.mjs 1.0.0
// Exits with an error if the version has no section, so a release can't go
// out without notes.

import { readFile } from 'node:fs/promises';

const version = process.argv[2];
if (!version) {
  console.error('Usage: node scripts/release-notes.mjs <version>');
  process.exit(1);
}

const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const start = changelog.search(new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`, 'm'));
if (start === -1) {
  console.error(`CHANGELOG.md has no "## [${version}]" section`);
  process.exit(1);
}
const rest = changelog.slice(start);
const end = rest.slice(3).search(/^## \[/m);
const section = end === -1 ? rest : rest.slice(0, end + 3);
// Drop the heading line: GitHub shows the release title separately
console.log(section.split('\n').slice(1).join('\n').trim());
