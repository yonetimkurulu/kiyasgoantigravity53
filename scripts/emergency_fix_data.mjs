
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'app', 'data.js');
let content = fs.readFileSync(dataPath, 'utf8');

const lines = content.split(/\r?\n/); // Split by CRLF or LF
let fixedCount = 0;

const fixedLines = lines.map(line => {
    // Trim carefully just for checking, but keep indentation
    const trimmed = line.trim();

    // Check if line looks like "image": "URL1URL2,
    if (trimmed.startsWith('"image": "') && trimmed.endsWith(',')) {

        // Check for double http protocols
        // Line content: spaces "image": "URL1URL2,

        // We look for:
        // 1. Prefix: spaces "image": "
        // 2. URL1: starts with https://, ends before second https://
        // 3. URL2: starts with https://, ends with ,

        // Note: Using a robust regex that doesn't anchor to $ strictly without accounting for match
        // But since we split by \r?\n, 'line' should not have \r.

        const doubleHttpMatch = line.match(/^(\s*"image":\s*")(https?:\/\/.*?)(https?:\/\/.*),$/);

        if (doubleHttpMatch) {
            console.log(`Fixing line: ${trimmed.substring(0, 50)}...`);
            fixedCount++;
            // Reconstruct: Prefix + URL1 + ",
            return `${doubleHttpMatch[1]}${doubleHttpMatch[2]}",`;
        }
    }
    return line;
});

fs.writeFileSync(dataPath, fixedLines.join('\n'), 'utf8'); // Use \n (Next.js/Git handles it)
console.log(`Fixed ${fixedCount} corrupted lines in app/data.js`);
