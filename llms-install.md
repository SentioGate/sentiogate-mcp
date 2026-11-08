# Installing SentioGate MCP Server (`@sentiogate/mcp`)

SentioGate works zero-config (no API key required for public model recommendations, benchmark lookups, tool safety checks, and log waste audits). An optional `SENTIOGATE_API_KEY` (`sg_live_...`) enables personal BYOK Vault and FinOps ledger queries.

## Option 1: Stdio via `npx` (Recommended for Cline / Claude Desktop / Cursor)

Add the following entry to your MCP settings (`cline_mcp_settings.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sentiogate": {
      "command": "npx",
      "args": ["-y", "@sentiogate/mcp"]
    }
  }
}
```

If the user provides a SentioGate API key (`sg_live_...`), include it in `env`:

```json
{
  "mcpServers": {
    "sentiogate": {
      "command": "npx",
      "args": ["-y", "@sentiogate/mcp"],
      "env": {
        "SENTIOGATE_API_KEY": "sg_live_..."
      }
    }
  }
}
```

## Option 2: Direct Streamable HTTP

Connect directly to `https://api.sentiogate.dev/v1/mcp` over Streamable HTTP (`2025-03-26` or `2024-11-05`).
