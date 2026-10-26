// Builds docs/terms/open_source_licenses.html from a solar-work checkout:
//   node scripts/open-source-licenses.mjs <solar-work dir>
// The checkout needs `npm ci` at its root and in ui/desktop (scripts may be skipped) and cargo on PATH.
// Only what ships is listed: Rust crates linked into the server and CLI binaries, npm packages that
// end up in the web and desktop bundles, Electron, and license files compiled into the binaries.
import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

const src = process.argv[2] && path.resolve(process.argv[2])
if (!src || !existsSync(path.join(src, "Cargo.toml"))) {
  console.error("usage: node scripts/open-source-licenses.mjs <solar-work dir>")
  process.exit(1)
}
const out = new URL("../docs/terms/open_source_licenses.html", import.meta.url)
const RUST_ROOTS = ["solar-agent-server", "solar-code-cli"]
// Release targets in solar-work .github/workflows/release.yml.
const TARGETS = ["aarch64-apple-darwin", "x86_64-pc-windows-msvc", "x86_64-unknown-linux-gnu"]
const LICENSE_FILE = /^(licen[cs]e|copying|notice|copyright|unlicense|ofl|authors)([-._].*)?$/i

function licenseFiles(dir) {
  return readdirSync(dir)
    .filter((f) => LICENSE_FILE.test(f) && !/\.(rs|js|ts|json|html|sh|py)$/i.test(f) && statSync(path.join(dir, f)).isFile())
    .sort()
    .map((f) => readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n").trim())
}

function rustCrates() {
  const args = ["metadata", "--format-version", "1", "--locked", ...TARGETS.flatMap((t) => ["--filter-platform", t])]
  const meta = JSON.parse(execFileSync("cargo", args, { cwd: src, maxBuffer: 1 << 28 }))
  const pkgs = new Map(meta.packages.map((p) => [p.id, p]))
  const nodes = new Map(meta.resolve.nodes.map((n) => [n.id, n]))
  const workspace = new Set(meta.workspace_members)
  const seen = new Set()
  const stack = meta.packages.filter((p) => workspace.has(p.id) && RUST_ROOTS.includes(p.name)).map((p) => p.id)
  if (stack.length !== RUST_ROOTS.length) throw new Error(`missing Rust roots: ${RUST_ROOTS}`)
  // Proc macros and build dependencies run at compile time and are not linked into the binary.
  while (stack.length) {
    const id = stack.pop()
    if (seen.has(id)) continue
    seen.add(id)
    if (pkgs.get(id).targets.some((t) => t.kind.includes("proc-macro"))) continue
    for (const dep of nodes.get(id).deps) {
      if (dep.dep_kinds.some((k) => k.kind === null)) stack.push(dep.pkg)
    }
  }
  return [...seen]
    .filter((id) => !workspace.has(id))
    .map((id) => pkgs.get(id))
    .filter((p) => !p.targets.some((t) => t.kind.includes("proc-macro")))
    .map((p) => ({
      name: p.name,
      version: p.version,
      license: p.license ?? (p.license_file ? "LicenseRef-file" : "UNKNOWN"),
      url: p.repository ?? p.homepage ?? `https://crates.io/crates/${p.name}`,
      authors: p.authors.map((a) => a.replace(/\s*<[^>]*>/, "")).join(", "),
      texts: licenseFiles(path.dirname(p.manifest_path)),
    }))
}

// Maps bundled module paths to the npm packages that own them (nearest node_modules/<name>).
function npmPackages(files) {
  const dirs = new Set()
  for (const file of files) {
    const m = file.replace(/\\/g, "/").match(/^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//)
    if (m) dirs.add(m[1])
  }
  return [...dirs].map((dir) => {
    const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
    const texts = licenseFiles(dir)
    const declared = typeof pkg.license === "string" ? pkg.license : pkg.license?.type
    const repo = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url
    return {
      name: pkg.name,
      version: pkg.version,
      license: declared ?? (/^(The )?MIT License/.test(texts[0] ?? "") ? "MIT" : "UNKNOWN"),
      url: (repo ?? pkg.homepage ?? `https://www.npmjs.com/package/${pkg.name}`)
        .replace(/^git\+/, "").replace(/^git:\/\//, "https://").replace(/\.git$/, "")
        .replace(/^github:/, "https://github.com/").replace(/^(?!https?:)([\w-]+\/[\w.-]+)$/, "https://github.com/$1"),
      authors: (typeof pkg.author === "string" ? pkg.author : pkg.author?.name ?? "").replace(/\s*[<(].*$/, ""),
      texts,
    }
  })
}

async function webModules() {
  const web = path.join(src, "web")
  const { build } = await import(pathToFileURL(createRequire(path.join(web, "package.json")).resolve("vite")).href)
  const ids = new Set()
  await build({
    root: web,
    configFile: path.join(web, "vite.config.ts"),
    logLevel: "warn",
    build: { write: false },
    plugins: [{
      name: "collect-bundled-modules",
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) for (const id of Object.keys(chunk.modules ?? {})) ids.add(id.replace(/^\0/, "").split("?")[0])
      },
    }],
  })
  return [...ids]
}

async function desktopModules() {
  const desktop = path.join(src, "ui/desktop")
  const { build } = await import(pathToFileURL(createRequire(path.join(desktop, "package.json")).resolve("esbuild")).href)
  // Same options as ui/desktop/build/bundle.mjs; only the inputs are read.
  const result = await build({
    absWorkingDir: desktop,
    entryPoints: { main: "src/main.ts", preload: "src/preload.ts" },
    outdir: "dist",
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node24",
    external: ["electron"],
    write: false,
    metafile: true,
    logLevel: "warning",
  })
  return Object.keys(result.metafile.inputs).map((f) => path.resolve(desktop, f))
}

function electron() {
  const dir = path.join(src, "ui/desktop/node_modules/electron")
  const [pkg] = npmPackages([path.join(dir, "package.json")])
  pkg.note = "Chromium·Node.js 등 Electron에 포함된 구성 요소의 라이선스는 설치된 앱 안의 LICENSES.chromium.html에 함께 들어 있습니다."
  return pkg
}

// License and NOTICE files that sit next to code or assets compiled into the binaries and web bundle.
function vendored() {
  const walk = (dir) => readdirSync(path.join(src, dir), { withFileTypes: true }).flatMap((e) => {
    const f = `${dir}/${e.name}`
    if (e.isDirectory()) return ["node_modules", "target", "tests", "test"].includes(e.name) ? [] : walk(f)
    return LICENSE_FILE.test(e.name) || /-LICENSE\.txt$/.test(e.name) ? [f] : []
  })
  const files = ["crates", "server", "web/src", "ui/desktop/src"].flatMap(walk).sort()
  const groups = new Map()
  for (const f of files) {
    const dir = path.dirname(f)
    const key = /-LICENSE\.txt$/.test(f) ? f : dir
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(readFileSync(path.join(src, f), "utf8").replace(/\r\n/g, "\n").trim())
  }
  return [...groups].map(([key, texts]) => ({
    name: /-LICENSE\.txt$/.test(key) ? path.basename(key).replace(/-LICENSE\.txt$/, "") : key.replace(/^crates\/core\/src\/plugin\/builtin\//, "내장 플러그인 ").replace(/^web\/src\/components\//, "화면 컴포넌트 "),
    version: "",
    license: "",
    url: "",
    texts,
  }))
}

const MIT = `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
const BSD3 = `Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`

// Packages that ship no license file get the standard text of their declared license.
// The Apache-2.0 text is borrowed from the packages that do ship it, since it carries no names.
function fillMissing(list) {
  const apache = list.flatMap((p) => p.texts).find((t) => /^\s*Apache License\s+Version 2\.0, January 2004/.test(t))
  for (const p of list.filter((p) => !p.texts.length)) {
    const owner = p.authors || `${p.name} authors`
    const text = /\bMIT\b/.test(p.license) ? `MIT License\n\nCopyright (c) ${owner}\n\n${MIT}`
      : /\bApache-2\.0\b/.test(p.license) && apache ? apache
      : /\bBSD-3-Clause\b/.test(p.license) ? `Copyright (c) ${owner}\n\n${BSD3}`
      : null
    if (!text) continue
    p.texts = [text]
    p.note = "패키지에 라이선스 파일이 없어, 선언된 라이선스의 표준 문구를 붙였습니다."
  }
  return list
}

function dedupe(list) {
  const byKey = new Map()
  for (const p of list) byKey.set(`${p.name}@${p.version}`, p)
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version))
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

// Packages whose license files are byte-identical share one block, so the page stays small.
function section(title, intro, list) {
  const blocks = new Map()
  for (const p of list) {
    const key = p.texts.join("\n\n----\n\n")
    if (!blocks.has(key)) blocks.set(key, [])
    blocks.get(key).push(p)
  }
  const rows = list.map((p) => `<tr><td>${p.url ? `<a href="${esc(p.url)}">${esc(p.name)}</a>` : esc(p.name)}</td><td>${esc(p.version)}</td><td>${esc(p.license)}</td></tr>`).join("\n")
  const texts = [...blocks].map(([text, pkgs]) => {
    const names = pkgs.map((p) => esc(p.version ? `${p.name} ${p.version}` : p.name)).join(", ")
    const note = pkgs.map((p) => p.note).filter(Boolean).map((n) => `<p class="note">${esc(n)}</p>`).join("")
    const body = text ? `<pre>${esc(text)}</pre>` : `<p class="muted">패키지에 라이선스 파일이 없습니다. 위 표의 라이선스(SPDX)를 따릅니다.</p>`
    return `<details><summary>${names}</summary>${note}${body}</details>`
  }).join("\n")
  return `<h2>${esc(title)} <span class="count">${list.length}</span></h2>
<p>${intro}</p>
<div class="table"><table><thead><tr><th>이름</th><th>버전</th><th>라이선스</th></tr></thead><tbody>
${rows}
</tbody></table></div>
<h3>라이선스 전문</h3>
${texts}`
}

const version = JSON.parse(readFileSync(path.join(src, "web/package.json"), "utf8")).version
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: src, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() } catch { return "" } })()
const rust = fillMissing(dedupe(rustCrates()))
const npm = fillMissing(dedupe(npmPackages([...(await webModules()), ...(await desktopModules())].map((f) => existsSync(f) ? realpathSync(f) : f))))
const bundled = [electron(), ...vendored()]
const missing = [...rust, ...npm].filter((p) => !p.texts.length).map((p) => `${p.name}@${p.version} (${p.license})`)

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>오픈소스 라이선스 | Solar Work</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--text:#1c1815;--muted:#5d6170;--line:#e4e6ec;--soft:#f6f7fa;--link:#3b5bdb}
@media (prefers-color-scheme:dark){:root{--bg:#16161a;--text:#ececf1;--muted:#a3a6b4;--line:#2e2f36;--soft:#1f2026;--link:#91a7ff}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",system-ui,sans-serif;font-size:15px;line-height:1.75;word-break:keep-all;overflow-wrap:anywhere;-webkit-font-smoothing:antialiased}
main{max-width:760px;margin:0 auto;padding:40px 16px 64px}
h1{font-size:24px;line-height:1.4;margin:0 0 6px}
.meta{color:var(--muted);font-size:13px;margin:0 0 28px;padding-bottom:20px;border-bottom:1px solid var(--line)}
h2{font-size:18px;margin:40px 0 8px}
h3{font-size:15px;margin:24px 0 8px}
.count{color:var(--muted);font-weight:500;font-size:14px}
p{margin:0 0 12px}
a{color:var(--link)}
.table{overflow-x:auto;margin:0 0 12px;max-height:480px;overflow-y:auto;border:1px solid var(--line);border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:13px;line-height:1.5}
th,td{border-bottom:1px solid var(--line);padding:6px 10px;text-align:left;vertical-align:top}
th{background:var(--soft);font-weight:600;position:sticky;top:0}
table{table-layout:fixed}th:nth-child(1){width:42%}th:nth-child(2){width:18%}td{overflow-wrap:anywhere}
details{border:1px solid var(--line);border-radius:8px;margin:0 0 8px;padding:0 12px}
summary{cursor:pointer;padding:8px 0;font-size:13px}
pre{white-space:pre-wrap;font-size:12px;line-height:1.55;background:var(--soft);border-radius:6px;padding:12px;margin:0 0 12px;max-height:480px;overflow:auto}
.note{background:var(--soft);border-radius:8px;padding:10px 12px;font-size:13px}
.muted{color:var(--muted);font-size:13px}
footer{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
</style>
</head>
<body>
<main>
<h1>오픈소스 라이선스</h1>
<p class="meta">Solar Work ${esc(version)}${commit ? ` (${esc(commit)})` : ""} 기준</p>
<p>Solar Work 데스크톱 앱, CLI, 웹 화면에는 아래 오픈소스 소프트웨어가 포함되어 있습니다. 각 소프트웨어의 저작권은 해당 저작권자에게 있으며, 각 라이선스 조건에 따라 사용합니다.</p>
${section("앱 서버 · CLI", "데스크톱 앱에 포함된 서버와 CLI 프로그램에 함께 빌드된 Rust 라이브러리입니다.", rust)}
${section("화면", "웹 화면과 데스크톱 앱 화면에 함께 묶여 배포되는 JavaScript 라이브러리와 글꼴입니다.", npm)}
${section("런타임 · 내장 리소스", "데스크톱 앱 런타임과, 프로그램에 함께 들어간 플러그인·글꼴·코드의 라이선스 및 고지문입니다.", bundled)}
<footer>주식회사 업스테이지</footer>
</main>
</body>
</html>
`
writeFileSync(out, html)
console.log(`rust ${rust.length} · npm ${npm.length} · bundled ${bundled.length} · ${(html.length / 1024).toFixed(0)} KiB`)
if (missing.length) console.log(`no license file (${missing.length}):\n  ${missing.join("\n  ")}`)
