// Checks on the Solar Work landing page: the script parses, every demo button
// has a scene, and the pure helpers (routing, request judging, downloads) behave.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
const markup = html.slice(0, html.lastIndexOf("<script>"));
const block = script.slice(script.indexOf("// <pure>"), script.indexOf("// </pure>"));
const lib = vm.runInNewContext(block + ";({ route, judge, pickAssets, detectOS })");

test("the page script parses", () => {
  assert.doesNotThrow(() => new vm.Script(script));
});

test("every tour and start button has a scene", () => {
  const scenes = new Set([...script.matchAll(/^  async (\w+)\(/gm)].map(m => m[1]));
  for (const k of ["deck", "auto", "steer", "team", "flow", "star"]) assert.ok(scenes.has(k), k);
  for (const [, k] of markup.matchAll(/data-(?:tour|start)="([^"]+)"/g)) assert.ok(scenes.has(k), `scene ${k}`);
});

test("no engineering jargon on the page", () => {
  const visible = markup.replace(/<style>[\s\S]*?<\/style>/, "").replace(/<[^>]+>/g, " ");
  for (const w of ["샌드박스", "YAML", "서브에이전트", "MCP", "ZDR", "하네스", "워크트리", "Seatbelt"])
    assert.ok(!visible.includes(w), w);
});

test("routes what visitors type to a scene", () => {
  assert.equal(lib.route("이 엑셀로 임원 보고용 발표자료 만들어줘"), "deck");
  assert.equal(lib.route("다운로드 폴더 정리해줘"), "auto");
  assert.equal(lib.route("3분기 매출 리포트 만들어줘"), "steer");
  assert.equal(lib.route("경쟁사 세 곳 동향 조사해줘"), "team");
  assert.equal(lib.route("매주 월요일 9시에 보고서 만들어서 팀에 보내줘"), "flow");
  assert.equal(lib.route("오늘 뭐 챙겨야 해?"), "star");
  assert.equal(lib.route("점심 메뉴 추천해줘"), null);
  assert.equal(lib.route("오늘 날씨 어때"), null);
  assert.equal(lib.route(""), null);
});

test("judges everyday requests the way the app does", () => {
  const tier = t => lib.judge(t).tier;
  assert.equal(tier("다운로드 폴더 파일들 종류별로 정리해줘"), "safe");
  assert.equal(tier("영수증 파일 이름을 날짜순으로 바꿔줘"), "safe");
  assert.equal(tier("중복된 사진 312장 지워줘"), "del");
  assert.equal(tier("휴지통 비워줘"), "del");
  assert.equal(tier("바탕화면 ‘세금’ 폴더도 같이 정리해줘"), "out");
  assert.equal(tier("보고서를 누구나 볼 수 있는 링크로 공유해줘"), "out");
  assert.equal(tier("크롬에 저장된 비밀번호 보여줘"), "block");
  assert.equal(lib.judge("  "), null);
});

test("picks installers from release assets", () => {
  const a = lib.pickAssets(["SolarWork-1.0.0-mac-arm64.dmg.blockmap", "SolarWork-1.0.0-mac-arm64.dmg", "SolarWork-1.0.0-win-x64-setup.exe", "SolarWork-1.0.0-linux-x64.AppImage", "SolarWork-1.0.0-linux-x64.deb", "SHA256SUMS"]);
  assert.equal(a.mac, "SolarWork-1.0.0-mac-arm64.dmg");
  assert.equal(a.win, "SolarWork-1.0.0-win-x64-setup.exe");
  assert.equal(a.linux, "SolarWork-1.0.0-linux-x64.AppImage");
  assert.equal(lib.pickAssets([]).mac, null);
  assert.equal(lib.pickAssets(undefined).win, null);
});

test("detects the visitor's OS", () => {
  assert.equal(lib.detectOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel"), "mac");
  assert.equal(lib.detectOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32"), "win");
  assert.equal(lib.detectOS("Mozilla/5.0 (X11; Linux x86_64)", "Linux x86_64"), "linux");
  assert.equal(lib.detectOS("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "iPhone"), "mobile");
  assert.equal(lib.detectOS("", ""), "web");
});
