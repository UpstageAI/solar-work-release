// Checks on the terms pages: one folder per kind, one file per version,
// self-contained, and never linked from the download site.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../docs/terms/", import.meta.url);
const kinds = ["age_14_or_over", "terms_of_service", "privacy_required", "privacy_marketing", "ad_messages"];
const pages = readdirSync(root, { recursive: true }).filter(p => p.endsWith(".html"));

test("every kind has a page", () => {
  for (const k of kinds) assert.ok(pages.some(p => p.startsWith(`${k}/`)), k);
});

test("pages live at <kind>/<YYYY-MM-DD>.html", () => {
  for (const p of pages) assert.match(p, /^[a-z0-9_]+\/\d{4}-\d{2}-\d{2}\.html$/, p);
});

test("pages are self-contained and state their version", () => {
  for (const p of pages) {
    const html = readFileSync(new URL(p, root), "utf8");
    assert.ok(!/<(?:link|img)\b|<script\s+src/i.test(html), `${p} loads external resources`);
    assert.ok(html.includes(`버전 ${p.slice(-15, -5)}`), `${p} version`);
    assert.match(html, /<title>[^<]+<\/title>/, p);
  }
});

test("versions.json lists every version, newest first", () => {
  for (const k of kinds) {
    const files = pages.filter(p => p.startsWith(`${k}/`)).map(p => p.slice(-15, -5)).sort().reverse();
    assert.deepEqual(JSON.parse(readFileSync(new URL(`${k}/versions.json`, root), "utf8")), files, k);
  }
});

test("the download site does not link the terms", () => {
  for (const f of ["index.html", "business.html"]) {
    const html = readFileSync(new URL(`../docs/${f}`, import.meta.url), "utf8");
    assert.ok(!html.includes("terms/"), f);
  }
});
