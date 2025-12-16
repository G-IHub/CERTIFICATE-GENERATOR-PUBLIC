#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
const backupDir = path.join(root, 'console-removal-backup');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (exts.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function removeConsoleLogsFromString(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf('console.log', i);
    if (idx === -1) {
      out += src.slice(i);
      break;
    }
    // copy up to idx
    out += src.slice(i, idx);
    let j = idx + 'console.log'.length;
    // skip whitespace
    while (j < src.length && /\s/.test(src[j])) j++;
    if (src[j] !== '(') {
      // not a normal call, keep as-is
      out += 'console.log';
      i = j;
      continue;
    }
    // found '