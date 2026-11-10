import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { validateLogFilePath } from '../bin/mcp-server.js';

test('manifests and executables exist', () => {
  assert.ok(existsSync('package.json'));
  assert.ok(existsSync('server.json'));
  assert.ok(existsSync('smithery.yaml'));
  assert.ok(existsSync('bin/mcp-server.js'));
  assert.ok(existsSync('.claude-plugin/plugin.json'));
  assert.ok(existsSync('.grok-plugin/marketplace.json'));
  assert.ok(existsSync('skills/sentiogate-finops/SKILL.md'));
});

test('validateLogFilePath restricts traversal outside cwd and checks extensions', () => {
  // Disallows directory traversal outside cwd
  assert.throws(
    () => validateLogFilePath('../secret.jsonl', false),
    /Access outside current working directory is denied/
  );

  // Disallows sensitive filenames
  assert.throws(
    () => validateLogFilePath('.env', false),
    /Reading sensitive file ".env" is not allowed/
  );

  // Disallows unauthorized extensions
  assert.throws(
    () => validateLogFilePath('script.py', false),
    /Invalid log file extension "\.py"/
  );

  // Allows legitimate relative path within cwd
  const valid = validateLogFilePath('package.json', false);
  assert.ok(valid.endsWith('package.json'));
});
