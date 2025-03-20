import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the worker file
const workerPath = path.resolve(__dirname, '../src/worker.js');
const workerCode = fs.readFileSync(workerPath, 'utf8');

// Create the TypeScript file with the worker code as a string
const outputPath = path.resolve(__dirname, '../src/worker-generated.ts');
const outputContent = `/**
 * This file is auto-generated from src/worker.js.
 * Do not modify this file directly, as it will be overwritten during the build process.
 * Instead, modify the src/worker.js file and run the build script.
 */

export const workerCode = \`${workerCode
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$')}\`;
`;

// Write the TypeScript file
fs.writeFileSync(outputPath, outputContent);

console.log('Worker code generated successfully!');
