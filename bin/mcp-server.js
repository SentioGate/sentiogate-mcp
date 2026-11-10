#!/usr/bin/env node
/**
 * @sentiogate/mcp - Official Model Context Protocol (MCP) CLI bridge
 * Connects standard stdio JSON-RPC clients (Claude Code, Cursor, Cline, OpenCode)
 * to the SentioGate edge MCP server (https://api.sentiogate.dev/v1/mcp).
 */

import readline from 'node:readline';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, basename } from 'node:path';

const API_BASE = process.env.SENTIOGATE_API_BASE || 'https://api.sentiogate.dev';
const MCP_URL = `${API_BASE.replace(/\/$/, '')}/v1/mcp`;
const API_KEY = process.env.SENTIOGATE_API_KEY || '';

const ALLOWED_LOG_EXTS = new Set(['.jsonl', '.json', '.csv', '.log', '.txt']);
const DISALLOWED_FILE_NAMES = new Set(['.env', 'id_rsa', 'id_ed25519', 'id_dsa', 'id_ecdsa']);
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export function validateLogFilePath(filePath, allowExternal = Boolean(process.env.SENTIOGATE_ALLOW_EXTERNAL_FILES)) {
  const fullPath = resolve(String(filePath));
  const cwd = process.cwd();

  if (!allowExternal) {
    if (fullPath !== cwd && !fullPath.startsWith(cwd + '/')) {
      throw new Error(`Access outside current working directory is denied (${filePath}).`);
    }
  }

  const base = basename(fullPath).toLowerCase();
  if (DISALLOWED_FILE_NAMES.has(base) || base.endsWith('.pem') || base.endsWith('.key')) {
    throw new Error(`Reading sensitive file "${base}" is not allowed.`);
  }

  const ext = extname(fullPath).toLowerCase();
  if (!ALLOWED_LOG_EXTS.has(ext)) {
    throw new Error(`Invalid log file extension "${ext}". Allowed: ${[...ALLOWED_LOG_EXTS].join(', ')}`);
  }

  return fullPath;
}

export async function processLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let payload;
  try {
    payload = JSON.parse(trimmed);
  } catch (err) {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${err.message}` },
      }) + '\n'
    );
    return;
  }

  // Notifications (no id) require no stdout response
  if (payload && !Array.isArray(payload) && payload.id === undefined) {
    return;
  }

  // Convenience for local CLI users: if sentiogate_audit_waste is given a local file_path,
  // read it locally so the edge receives raw_logs directly.
  if (
    payload?.method === 'tools/call' &&
    payload?.params?.name === 'sentiogate_audit_waste' &&
    payload?.params?.arguments?.file_path &&
    !payload?.params?.arguments?.raw_logs &&
    !payload?.params?.arguments?.records
  ) {
    try {
      const fullPath = validateLogFilePath(payload.params.arguments.file_path);
      const fileStat = await stat(fullPath);
      if (fileStat.size > MAX_LOG_FILE_SIZE) {
        throw new Error(`File size (${(fileStat.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit (10MB).`);
      }
      payload.params.arguments.raw_logs = await readFile(fullPath, 'utf8');
    } catch (fileErr) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: payload.id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Could not read local file_path: ${fileErr.message}` }],
          },
        }) + '\n'
      );
      return;
    }
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'SentioGate-MCP-CLI/1.0.0',
    };
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 202 || response.status === 204) {
      return;
    }

    if (!response.ok) {
      const errBody = await response.text();
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: payload.id ?? null,
          error: {
            code: -32603,
            message: `SentioGate edge returned HTTP ${response.status}: ${errBody.slice(0, 200)}`,
          },
        }) + '\n'
      );
      return;
    }

    const resJson = await response.json();
    process.stdout.write(JSON.stringify(resJson) + '\n');
  } catch (err) {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: payload?.id ?? null,
        error: {
          code: -32603,
          message: `Transport error: ${err.message}`,
        },
      }) + '\n'
    );
  }
}

export function startServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  let queue = Promise.resolve();

  rl.on('line', (line) => {
    queue = queue.then(() => processLine(line)).catch(() => {});
  });
}

// Auto-start when executed as the main CLI entry point
if (process.argv[1] && process.argv[1].endsWith('mcp-server.js') && !process.env.NODE_TEST_CONTEXT) {
  startServer();
}
