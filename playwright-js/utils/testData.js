import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load JSON test data from /test-data.
 * @param {string} fileName e.g. "users.json"
 */
export function loadTestData(fileName) {
  const filePath = path.join(__dirname, '..', 'test-data', fileName);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}
