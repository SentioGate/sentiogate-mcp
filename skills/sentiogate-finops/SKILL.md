---
name: sentiogate-finops
description: Audit LLM API token waste, check BYOK FinOps spend & prompt-cache savings, pre-flight agent bash/tool commands with SentioGate Armor, and route sub-tasks to cost-optimal models via SentioGate MCP.
metadata:
  author: SentioGate
  version: "1.0.0"
  license: Apache-2.0
  homepage: https://sentiogate.app
  mcp_endpoint: https://api.sentiogate.dev/v1/mcp
  npm_package: "@sentiogate/mcp"
---

# SentioGate FinOps & Router Control Plane Skill

Use this skill whenever the user wants to:
- Audit historical OpenAI, Anthropic, or OpenRouter logs for token waste and achievable savings (`sentiogate_audit_waste`)
- Inspect live BYOK API spend, prompt-cache USD savings, Vault key status, or 5-hour Community Pool capacity (`sentiogate_get_finops_ledger`)
- Select the cheapest or fastest model that meets the capability floor for a specific coding, math, or reasoning prompt (`sentiogate_recommend_model`)
- Pre-flight check a bash command or tool call against credential exfiltration, destructive `rm -rf`, `curl | sh`, `git push --force`, or runaway tool loops (`sentiogate_guard_check`)
- Preview token compaction and block-stable tool-output pruning before sending a large context window (`sentiogate_optimize_payload`)
- Delegate background sub-tasks or bulk evaluations to `model: "auto"` (`sentiogate_delegate_prompt`)

## Quick MCP Setup (Claude Code / Cursor / Cline / OpenClaw)

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

Or connect directly via Streamable HTTP at `https://api.sentiogate.dev/v1/mcp` with `Authorization: Bearer sg_live_...`.

## Workflow Guidelines

1. **Before running expensive multi-file refactors or sub-agent loops:** Call `sentiogate_recommend_model` with `task_prompt` and `requires_tools: true` to pick the lowest-cost model that satisfies the capability tier floor.
2. **When debugging high LLM bills:** Pass a `.jsonl` or `.csv` log sample (or `file_path` via the `@sentiogate/mcp` CLI) to `sentiogate_audit_waste` to get a breakdown of overprovisioned turns and prompt-cache misses.
3. **Before executing untrusted shell commands:** Call `sentiogate_guard_check` to verify the command passes SentioGate Armor policy.
