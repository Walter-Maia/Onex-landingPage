const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
// Only this fixed, project-owned output directory is replaced.
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw Error('Invalid output directory');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of ['index.html', 'css', 'js', 'assets', '.nojekyll']) {
  fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
}
let total = 0;
function inspect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) inspect(p);
    else total += fs.statSync(p).size;
  }
}
inspect(out);
console.log(`Site prepared in dist/ (${(total / 1024).toFixed(0)} KiB). Only public site assets are included.`);
