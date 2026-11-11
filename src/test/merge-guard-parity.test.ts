import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MERGE_TABLES } from "@/lib/account-merge-rules";

// The live merge runs inside execute_account_merge (SQL). Every table the app
// manifest says must block a merge has to be guarded there too.
describe("account merge guards", () => {
  it("every skip table in the manifest is guarded by the SQL merge", () => {
    const dir = join(process.cwd(), "db");
    const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
    const skip = Object.entries(MERGE_TABLES).filter(([, r]) => r.strategy === "skip").map(([t]) => t);
    expect(skip.filter((t) => !sql.includes(`merge_blocked:${t}`))).toEqual([]);
  });

  it("recovery vaults and card generations block a merge", () => {
    for (const t of ["recovery_vaults", "recovery_attempts", "rout_card_generations", "card_freezes", "wallet_passes"]) {
      expect(MERGE_TABLES[t]?.strategy).toBe("skip");
    }
  });
});
