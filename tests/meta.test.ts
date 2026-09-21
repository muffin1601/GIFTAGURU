import test from "node:test";
import assert from "node:assert/strict";
import { trackLead } from "@/lib/analytics/meta";

test("Meta Lead event is sent only when the Pixel is available", () => {
  const events: string[][] = [];
  Object.assign(globalThis, {
    window: { fbq: (...args: string[]) => events.push(args) },
  });

  assert.equal(trackLead(), true);
  assert.deepEqual(events, [["track", "Lead"]]);
});

test("Meta Lead tracking is safe when the Pixel is absent", () => {
  Object.assign(globalThis, { window: {} });
  assert.equal(trackLead(), false);
});
