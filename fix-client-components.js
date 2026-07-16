const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('app');
let modifiedCount = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.match(/onClick|onChange|onSubmit|useState|useEffect/)) {
    if (!content.includes('use client')) {
      if (!content.includes('export default async function') && !content.includes('export async function')) {
         fs.writeFileSync(file, "'use client';\n" + content);
         console.log('Added use client to: ' + file);
         modifiedCount++;
      }
    }
  }
});
console.log('Total files modified: ' + modifiedCount);
