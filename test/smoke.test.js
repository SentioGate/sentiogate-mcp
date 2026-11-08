import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('manifests and executables exist', () => {
  assert.ok(existsSync('package.json'));
  assert.ok(existsSync('server.json'));
  assert.ok(existsSync('smithery.yaml'));
  assert.ok(existsSync('bin/mcp-server.js'));
  assert.ok(existsSync('.claude-plugin/plugin.json'));
  assert.ok(existsSync('.grok-plugin/marketplace.json'));
  assert.ok(existsSync('skills/sentiogate-finops/SKILL.md'));
});
