const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('dist directory not found. Run `npm run build` first.');
  process.exit(2);
}

function findScriptRefs(html) {
  const re = /<script[^>]+src=["']([^"']+)["'][^>]*>/g;
  const matches = [];
  let m;
  while ((m = re.exec(html)) !== null) matches.push(m[1]);
  return matches;
}

function findLinkRefs(html) {
  const re = /<link[^>]+href=["']([^"']+)["'][^>]*>/g;
  const matches = [];
  let m;
  while ((m = re.exec(html)) !== null) matches.push(m[1]);
  return matches;
}

const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));
let ok = true;
for (const htmlFile of htmlFiles) {
  const htmlPath = path.join(distDir, htmlFile);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scripts = findScriptRefs(html);
  const links = findLinkRefs(html);
  console.log(`Checking ${htmlFile} -> scripts: ${scripts.length}, links: ${links.length}`);

  for (const src of [...scripts, ...links]) {
    // ignore external
    if (src.startsWith('http') || src.startsWith('//')) continue;
    // normalize leading slash
    const rel = src.startsWith('/') ? src.slice(1) : src;
    const target = path.join(distDir, rel);
    if (!fs.existsSync(target)) {
      console.error(`Missing file referenced in ${htmlFile}: ${src} -> expected at ${target}`);
      ok = false;
    }
  }
}

if (!ok) process.exit(1);
console.log('All referenced assets exist in dist.');
process.exit(0);
