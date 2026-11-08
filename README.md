# @sentiogate/mcp

> Official Model Context Protocol (MCP) server for **SentioGate** — Zero-markup BYOK LLM router & FinOps control plane.

Expose real-time LLM cost analytics, token-waste auditing, task-based model recommendations, and tool-safety inspection directly inside **Claude Code**, **Cursor**, **Cline**, **OpenClaw**, and **Google Gemini / Search (Connected Apps)**.

---

## Features (Exposed MCP Tools)

1. **`sentiogate_audit_waste`** — Scan past completion logs (JSON, JSONL, or CSV) to calculate dollar waste, prompt-cache misses, and potential savings with SentioGate.
2. **`sentiogate_get_finops_ledger`** — Retrieve live spend, cache savings, and remaining 5-hour Community Pool quota.
3. **`sentiogate_recommend_model`** — Classify prompt difficulty and receive optimal model + provider fallback chain based on empirical benchmarks and live TTFT.
4. **`sentiogate_guard_check`** — Pre-flight check terminal commands and tool calls against SentioGate Armor safety rules (credential leak, destructive deletions, reverse shells).
5. **`sentiogate_optimize_payload`** — Simulate prompt compaction and tool-output trimming to preview token savings before model invocation.

---

## Quick Setup

### 1. Claude Code
Run in your project directory:
```bash
claude mcp add sentiogate -- npx -y @sentiogate/mcp
```

### 2. Cursor / Cline (`mcpServers` config)
Add to your `mcpServers` configuration (`settings.json` or `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "sentiogate": {
      "command": "npx",
      "args": ["-y", "@sentiogate/mcp"],
      "env": {
        "SENTIOGATE_API_KEY": "sg_live_your_api_key_here"
      }
    }
  }
}
```

### 3. Remote HTTP Endpoint (Google Connected Apps / Gemini)
For remote MCP environments, point directly to the edge HTTP endpoint:
* **Server URL:** `https://api.sentiogate.dev/v1/mcp`
* **Transport:** Streamable HTTP / SSE (MCP `2024-11-05`)
* **Headers:** `Authorization: Bearer <your_key>` (optional, public tools work unauthenticated)

---

## License

Apache-2.0 © [SentioGate Team](https://sentiogate.app)
