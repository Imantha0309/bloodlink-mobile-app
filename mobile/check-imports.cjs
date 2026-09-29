const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'src');
const files = [];
const walk = (p) => {
  const stat = fs.statSync(p);
  if (stat.isDirectory()) fs.readdirSync(p).forEach((e) => walk(path.join(p, e)));
  else if (/\.jsx?$/.test(p)) files.push(p);
};
walk(root);
files.push(path.resolve(__dirname, 'App.jsx'));

const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '/index.js', '/index.jsx'];

const resolve = (from, spec) => {
  const base = path.resolve(path.dirname(from), spec);
  return exts.some((e) => fs.existsSync(base + e) && fs.statSync(base + e).isFile());
};

const missing = [];
const seen = new Set();

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /(?:from|require\()\s*['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1];
    if (!resolve(file, spec)) {
      const key = `${file}|${spec}`;
      if (seen.has(key)) continue;
      seen.add(key);
      missing.push(`${path.relative(__dirname, file)}  ->  ${spec}`);
    }
  }
}

if (missing.length) {
  console.log(`${missing.length} unresolved import(s):\n`);
  missing.forEach((l) => console.log('  ' + l));
  process.exit(1);
}
console.log(`All relative imports resolve across ${files.length} files`);
