import { existsSync, readFileSync } from "node:fs";
import { DATA_PATH, PUBLIC_CATALOG_PATH, DATA_DIR, LATEST_PATH, ARCHIVE_DIR, readData } from "./lib.mjs";
import { ensureCms, mergeEntries } from "./catalog.mjs";

const checks = [];
function ok(name, pass, detail = "") {
	checks.push({ name, pass: !!pass, detail });
	console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const pathNorm = (p) => String(p).replace(/\\/g, "/");
ok("DATA_PATH is docs/catalog.json (原位置)", pathNorm(DATA_PATH).endsWith("docs/catalog.json"), DATA_PATH);
ok("docs/catalog.json exists", existsSync(DATA_PATH));

const d = readData();
ok("catalog readable", Array.isArray(d.apis) && d.apis.length > 0, `${d.apis.length} apis`);
ok("catalog brand", d.brand === "影视采集站信号台", d.brand);
ok("catalog repo", /Years--Collect/.test(d.repo || ""), d.repo);

ok("public mirror exists", existsSync(PUBLIC_CATALOG_PATH));
const pub = JSON.parse(readFileSync(PUBLIC_CATALOG_PATH, "utf8"));
ok("public mirror apis match", pub.apis?.length === d.apis.length, `${pub.apis?.length} vs ${d.apis.length}`);

ok("data dir", existsSync(DATA_DIR));
ok("latest.json", existsSync(LATEST_PATH));
ok("archives", existsSync(ARCHIVE_DIR));
ok("catalog helpers", typeof ensureCms === "function" && typeof mergeEntries === "function");

const scripts = [
	"sync-yszzq.mjs",
	"sync-ziyuanzu.mjs",
	"sync-github.mjs",
	"classify.mjs",
	"monitor.mjs",
	"sync.mjs",
	"catalog.mjs",
	"lib.mjs",
	"git-push-catalog.sh",
];
for (const s of scripts) ok(`script ${s}`, existsSync(new URL(`./${s}`, import.meta.url)));

ok("mcp server", existsSync(new URL("../mcp/mcp_server.mjs", import.meta.url)));
ok("mcp json", existsSync(new URL("../mcp/mcp.json", import.meta.url)));
const mcp = readFileSync(new URL("../mcp/mcp_server.mjs", import.meta.url), "utf8");
ok("mcp catalog path", mcp.includes("docs") && mcp.includes("catalog.json") && !mcp.includes("collect-assets"));

const lib = readFileSync(new URL("./lib.mjs", import.meta.url), "utf8");
ok("lib writeData syncs public", lib.includes("syncPublicCatalog") && lib.includes("PUBLIC_CATALOG_PATH"));

const desk = readFileSync(new URL("../public/collect-assets/desk.js", import.meta.url), "utf8");
ok("desk SITE_BASE", desk.includes("SITE_BASE"));
ok("desk 18+ pack", desk.includes("buckets.adult") && desk.includes("dlAdult") && desk.includes("dlOptAdult"));
ok("desk packOf full", /packOf = \(key\) => \(key === 'all' \? buckets\.all :/.test(desk));

const dl = readFileSync(new URL("../src/pages/collect/desk/download.astro", import.meta.url), "utf8");
ok("download page 18+", dl.includes('id="dlAdult"') && dl.includes('value="adult"'));

const pages = [
	"../src/pages/collect/index.astro",
	"../src/pages/collect/desk/index.astro",
	"../src/pages/collect/desk/category.astro",
	"../src/pages/collect/desk/detail.astro",
	"../src/pages/collect/desk/download.astro",
	"../src/pages/collect/desk/guide.astro",
	"../src/pages/collect/desk/submit.astro",
];
for (const p of pages) ok(`page ${p}`, existsSync(new URL(p, import.meta.url)));

const wf = [
	"../.github/workflows/collect-maintenance.yml",
	"../.github/workflows/collect-health.yml",
	"../.github/workflows/pages.yml",
	"../.github/ISSUE_TEMPLATE/submit.yml",
	"../.github/ISSUE_TEMPLATE/bug.yml",
];
for (const p of wf) ok(`github ${p}`, existsSync(new URL(p, import.meta.url)));

const maint = readFileSync(new URL("../.github/workflows/collect-maintenance.yml", import.meta.url), "utf8");
const health = readFileSync(new URL("../.github/workflows/collect-health.yml", import.meta.url), "utf8");
const pagesYml = readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
ok("workflow pushes docs/catalog.json", maint.includes("docs/catalog.json") && health.includes("docs/catalog.json"));
ok("pages verifies docs/catalog.json", pagesYml.includes("docs/catalog.json"));
ok("git-push default includes docs", readFileSync(new URL("./git-push-catalog.sh", import.meta.url), "utf8").includes("docs/catalog.json"));

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
for (const k of ["collect:yszzq", "collect:ziyuanzu", "collect:github", "collect:classify", "collect:health", "collect:mcp"]) {
	ok(`npm script ${k}`, !!pkg.scripts[k]);
}

const failed = checks.filter((c) => !c.pass);
console.log("\n=== SUMMARY ===");
console.log(`passed ${checks.length - failed.length}/${checks.length}`);
if (failed.length) {
	console.log("failed:", failed.map((f) => f.name).join(", "));
	process.exit(1);
}
console.log("对接检查通过（自动化原位置 docs/catalog.json）");
