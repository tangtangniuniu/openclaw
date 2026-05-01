import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSON5 from "json5";
import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";
import { withTempHome } from "./test-helpers.js";
import { validateConfigObject } from "./validation.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const examplePath = path.join(repoRoot, "study/examples/multi-agent-enterprise.openclaw.json5");

function readEnterpriseExample(): string {
  return readFileSync(examplePath, "utf8");
}

describe("enterprise multi-agent example", () => {
  it("validates the published enterprise example", () => {
    const parsed = JSON5.parse(readEnterpriseExample());
    const res = validateConfigObject(parsed);
    expect(res.ok).toBe(true);
    if (!res.ok) {
      return;
    }

    expect(res.config.agents?.defaults?.subagents?.requireAgentId).toBe(true);
    expect(res.config.agents?.defaults?.subagents?.maxSpawnDepth).toBe(2);
    expect(res.config.agents?.defaults?.subagents?.maxChildrenPerAgent).toBe(4);
    expect(res.config.tools?.agentToAgent?.enabled).toBe(true);
    expect(res.config.tools?.sessions?.visibility).toBe("tree");

    const coordinator = res.config.agents?.list?.find((agent) => agent.id === "coordinator");
    expect(coordinator?.default).toBe(true);
    expect(coordinator?.subagents?.allowAgents).toEqual(["research", "ops", "approvals"]);
  });

  it("loads the enterprise example from disk with resolved per-agent directories", async () => {
    await withTempHome(async (home) => {
      const configPath = path.join(home, ".openclaw", "openclaw.json");
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, readEnterpriseExample(), "utf8");

      const cfg = loadConfig();
      const coordinator = cfg.agents?.list?.find((agent) => agent.id === "coordinator");
      const ops = cfg.agents?.list?.find((agent) => agent.id === "ops");

      expect(coordinator?.agentDir).toBe(path.join(home, ".openclaw/agents/coordinator/agent"));
      expect(coordinator?.workspace).toBe(path.join(home, ".openclaw/workspace-coordinator"));
      expect(ops?.model).toBe("anthropic/claude-sonnet-4-6");
      expect(cfg.bindings?.map((binding) => binding.agentId)).toEqual([
        "coordinator",
        "ops",
        "approvals",
        "research",
      ]);
    });
  });
});
