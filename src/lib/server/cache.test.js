// Run: node --test src/lib/server
import assert from "node:assert/strict";
import test from "node:test";
import { cached } from "./cache.js";

test("cached reuses a hit and evicts a failure", async () => {
  let calls = 0;
  const ok = () => Promise.resolve(++calls);
  assert.equal(await cached("a", 60, ok), 1);
  assert.equal(await cached("a", 60, ok), 1);

  await assert.rejects(cached("b", 60, () => Promise.reject(new Error("x"))));
  assert.equal(await cached("b", 60, ok), 2);
});
