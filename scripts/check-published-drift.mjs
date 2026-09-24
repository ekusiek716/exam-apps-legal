#!/usr/bin/env node
/**
 * 公開物ドリフト検査 — 「main にマージ済みだが公開ページへ未反映」を実URLで検出する。
 *
 * 背景: GitHub Pages のビルドは非同期で、失敗しても手元では何も起きない。
 * exam-kit 側で同種の見落とし（#1036）が起きたため、公開4ページについても
 * 「リポジトリの本文が実際に配信されているか」を機械的に確かめられるようにする。
 *
 * Jekyll のビルドをローカルで再現するとRuby環境に依存するため、HTMLのバイト一致では
 * なく **本文テキストの含有** で判定する。markdown の記法を落とした各行が、公開ページの
 * テキストに出現するかを見る。日本語の折り返し差を拾わないよう、両側から空白を除いて
 * 比較する。
 *
 * 使い方:
 *   node scripts/check-published-drift.mjs
 *   node scripts/check-published-drift.mjs --base=https://ekusiek716.github.io/exam-apps-legal
 *   node scripts/check-published-drift.mjs --limit=20
 *
 * 終了コード: 0 一致 / 1 未反映あり / 2 到達不能（＝未反映の証拠にはならない）
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_BASE = "https://ekusiek716.github.io/exam-apps-legal";

/** 公開対象。drafts/ は公開ページではないので含めない（AGENTS.md「文書の扱い」）。 */
const PAGES = [
  { file: "index.md", urlPath: "/" },
  { file: "privacy.md", urlPath: "/privacy" },
  { file: "support.md", urlPath: "/support" },
  { file: "terms.md", urlPath: "/terms" },
  { file: "tokushoho.md", urlPath: "/tokushoho" },
];

/** リポジトリ直下にあるが公開ページではない markdown。 */
const NON_PAGE_MARKDOWN = new Set(["README.md", "AGENTS.md"]);

/** 短すぎる断片はどのページにも偶然含まれてしまい、検査にならない。 */
const MIN_UNIT_LENGTH = 12;

function parseArgs(argv) {
  const opts = { base: DEFAULT_BASE, limit: 10 };
  for (const arg of argv) {
    if (arg.startsWith("--base=")) opts.base = arg.slice("--base=".length);
    else if (arg.startsWith("--limit=")) opts.limit = Number(arg.slice("--limit=".length));
  }
  opts.base = opts.base.replace(/\/$/, "");
  return opts;
}

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

/**
 * 比較用の正規化。
 * - 空白は折り返し位置が処理系で変わるため、両側から完全に落とす。
 * - kramdown は引用符・ダッシュ・三点リーダを活字風に置き換えるため、
 *   markdown 側の素の文字と一致するよう両側を同じ形へ寄せる。
 */
const normalize = (text) =>
  decodeEntities(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\s+/gu, "");

/** markdown の記法を落とし、本文として配信されるはずの文字列だけにする。 */
function stripInlineMarkdown(line) {
  return line
    .replace(/<[^>]+>/g, " ") // 本文中の生HTML（`<br>` 等）はテキストとして出ない
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 画像は本文テキストに出ない
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンクはラベルだけ残る
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1");
}

/** 1ページ分の markdown から、公開ページに出るはずのテキスト単位を取り出す。 */
export function extractTextUnits(markdown) {
  const withoutFrontMatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  const units = [];
  // Liquid の条件ブロック（`{% if %}` 〜 `{% endif %}`）は `_config.yml` の設定で
  // 出たり出なかったりするため、出ないことを未反映と誤判定しないよう検査から外す。
  let liquidDepth = 0;
  for (const rawLine of withoutFrontMatter.split("\n")) {
    const line = rawLine.trim();
    const opens = line.match(/\{%\s*(if|unless)\b/g)?.length ?? 0;
    const closes = line.match(/\{%\s*end(if|unless)\b/g)?.length ?? 0;
    if (opens > 0 || closes > 0) {
      // 同一行に開始と終了が両方ある（`{% if %}…{% endif %}`）場合に深さが
      // 負へ振れないよう、開始と終了を別々に数える。
      liquidDepth = Math.max(0, liquidDepth + opens - closes);
      continue;
    }
    if (liquidDepth > 0) continue;
    if (line.includes("{%") || line.includes("{{")) continue;
    if (!line) continue;
    if (/^[-|: ]+$/.test(line)) continue; // 表の区切り行はテキストとして出ない
    const body = stripInlineMarkdown(line)
      .replace(/^#{1,6}\s*/, "")
      .replace(/^>\s*/, "")
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "");
    // 表は行ごとではなくセルごとに配信されるため、セル単位へ割る。
    const candidates = body.includes("|") ? body.split("|") : [body];
    for (const candidate of candidates) {
      const unit = candidate.trim();
      if (normalize(unit).length >= MIN_UNIT_LENGTH) units.push(unit);
    }
  }
  return units;
}

/** 公開HTMLから本文テキストを取り出す。 */
export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

/**
 * `PAGES` がリポジトリの実態とずれていないか確かめる。
 * ページが増えたのに `PAGES` へ足し忘れると、そのページだけ検査されないまま
 * 緑になる（`support.md` が AGENTS.md の公開対象から漏れていたのと同じ事故）。
 */
function findPageListDrift() {
  const onDisk = readdirSync(REPO_ROOT)
    .filter((name) => name.endsWith(".md") && !NON_PAGE_MARKDOWN.has(name))
    .sort();
  const listed = new Set(PAGES.map((page) => page.file));
  return {
    unlisted: onDisk.filter((name) => !listed.has(name)),
    missingFile: PAGES.filter((page) => !existsSync(path.join(REPO_ROOT, page.file))).map(
      (page) => page.file,
    ),
  };
}

async function main() {
  const { unlisted, missingFile } = findPageListDrift();
  if (unlisted.length > 0 || missingFile.length > 0) {
    for (const name of unlisted) {
      console.error(`[PAGES 未登録] ${name} が公開ページ一覧に無いため検査されません`);
    }
    for (const name of missingFile) {
      console.error(`[PAGES 不整合] ${name} は一覧にあるがファイルが見つかりません`);
    }
    console.error("scripts/check-published-drift.mjs の PAGES を実態に合わせてください。");
    process.exit(1);
  }
  const { base, limit } = parseArgs(process.argv.slice(2));
  const drifted = [];
  const unreachable = [];
  let checkedUnits = 0;

  for (const page of PAGES) {
    const markdown = readFileSync(path.join(REPO_ROOT, page.file), "utf8");
    const units = extractTextUnits(markdown);
    let res;
    try {
      // 中間キャッシュの古い応答を「未反映」と誤判定しないよう再検証を強制する。
      res = await fetch(`${base}${page.urlPath}`, {
        redirect: "follow",
        headers: { "cache-control": "no-cache", pragma: "no-cache" },
      });
    } catch (error) {
      unreachable.push({ page, reason: String(error?.message ?? error) });
      continue;
    }
    if (!res.ok) {
      unreachable.push({ page, reason: `HTTP ${res.status}` });
      continue;
    }
    const liveText = normalize(htmlToText(await res.text()));
    const missing = units.filter((unit) => !liveText.includes(normalize(unit)));
    checkedUnits += units.length;
    if (missing.length > 0) drifted.push({ page, missing, total: units.length });
  }

  console.log(`公開物ドリフト検査: ${base}`);
  console.log(
    `  対象 ${PAGES.length} ページ / ${checkedUnits} 行 — 未反映 ${drifted.length} ページ / 到達不能 ${unreachable.length} ページ`,
  );
  for (const item of drifted) {
    console.log(`  [未反映] ${item.page.urlPath}（${item.page.file}）${item.missing.length}/${item.total} 行が公開ページに無い`);
    for (const unit of item.missing.slice(0, limit)) {
      console.log(`      - ${unit.length > 80 ? `${unit.slice(0, 80)}…` : unit}`);
    }
    if (item.missing.length > limit) console.log(`      …ほか ${item.missing.length - limit} 行`);
  }
  for (const item of unreachable) {
    console.log(`  [到達不能] ${item.page.urlPath}: ${item.reason}`);
  }

  if (drifted.length > 0) {
    console.error(
      "\nmain の本文が公開ページへ反映されていません。" +
        "\nGitHub Pages のビルド状況を確認してください（リポジトリの Actions / Pages 設定）。",
    );
    process.exit(1);
  }
  if (unreachable.length > 0) {
    console.error("\n到達できないページがあるため、未反映かどうかを判定できませんでした。");
    process.exit(2);
  }
  console.log("差分なし（main の本文が公開ページに出ている）。");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
