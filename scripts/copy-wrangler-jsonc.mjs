import { copyFileSync, existsSync, writeFileSync } from 'node:fs';

const WRANGLER_JSONC_PATH = 'wrangler.jsonc';
const WRANGLER_JSONC_EXAMPLE_PATH = 'wrangler.jsonc.example';

if (!existsSync(WRANGLER_JSONC_PATH)) {
  if (existsSync(WRANGLER_JSONC_EXAMPLE_PATH)) {
    copyFileSync(WRANGLER_JSONC_EXAMPLE_PATH, WRANGLER_JSONC_PATH);
  } else {
    writeFileSync(WRANGLER_JSONC_PATH, '');
  }
}
