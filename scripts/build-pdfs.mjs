import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync, execSync } from "child_process";

const REPO_ROOT = process.cwd();
const POSTS_JSON = path.join(REPO_ROOT, "posts.json");
const PDFS_DIR = path.join(REPO_ROOT, "pdfs");

if (!fs.existsSync(PDFS_DIR)) fs.mkdirSync(PDFS_DIR, { recursive: true });

function getPublishedAt(post) {
  return post.publishedAt || post.publishedat || "";
}

function normalizePostsJson(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.posts)) return data.posts;
  return [];
}

function stripReadMoreParagraphs(html) {
  if (!html) return "";
  return html.replace(/<p[^>]*>\s*read more here[\s\S]*?<\/p>/gi, "");
}

function latexEscapeTitle(s) {
  return (s ?? "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[{]/g, "\\{")
    .replace(/[}]/g, "\\}")
    .replace(/[$]/g, "\\$")
    .replace(/[%]/g, "\\%")
    .replace(/[#]/g, "\\#")
    .replace(/[_]/g, "\\_")
    .replace(/[&]/g, "\\&")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function toLatexBodyViaPandoc(html) {
  return execSync("pandoc -f html -t latex --wrap=none --no-highlight", {
    input: html,
    encoding: "utf-8",
  });
}

function memoirDoc({ title, bodyLatex }) {
  return String.raw`\documentclass[11pt,a4paper,oneside]{memoir}

% Fonts (robust: no fontspec / no OS font discovery)
\usepackage[T1]{fontenc}
\usepackage{tgpagella}
\usepackage{inconsolata}
\usepackage{microtype}

% Layout (memoir-native)
\setlrmarginsandblock{1.15in}{1.15in}{*}
\setulmarginsandblock{1.0in}{1.0in}{*}
\checkandfixthelayout

% No headers/footers/page numbers
\pagestyle{empty}

% Paragraph style
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.55\baselineskip}

% Pandoc helpers
\usepackage{xcolor}
\usepackage[hidelinks]{hyperref}
\providecommand{\tightlist}{%
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}}

\begin{document}

{\Large\bfseries ${latexEscapeTitle(title)}\par}
\vspace{1.25em}

${bodyLatex}

\end{document}
`;
}

function main() {
  const data = JSON.parse(fs.readFileSync(POSTS_JSON, "utf-8"));
  const posts = normalizePostsJson(data);

  posts.sort((a, b) => new Date(getPublishedAt(b)) - new Date(getPublishedAt(a)));

  console.log(`Found ${posts.length} posts. Generating missing PDFs only...\n`);

  const baseTmp = fs.mkdtempSync(path.join(os.tmpdir(), "alessandrosblog-pdf-"));

  let ok = 0;
  let skipped = 0;
  let fail = 0;

  for (const post of posts) {
    const slug = post.slug;
    const title = post.title || "Untitled";
    const contentHtml = post.content || "";

    if (!slug) {
      console.warn("Skipping post without slug\n");
      continue;
    }

    const outPdf = path.join(PDFS_DIR, `${slug}.pdf`);

    // Skip rule: if the PDF already exists, do nothing.
    if (fs.existsSync(outPdf)) {
      console.log(`Skipping: ${slug}.pdf (already exists)\n`);
      skipped++;
      continue;
    }

    console.log(`Building: ${slug}.pdf`);

    const jobDir = fs.mkdtempSync(path.join(baseTmp, `${slug}-`));
    const texPath = path.join(jobDir, `${slug}.tex`);
    const pdfPath = path.join(jobDir, `${slug}.pdf`);

    try {
      const filteredHtml = stripReadMoreParagraphs(contentHtml);
      const bodyLatex = toLatexBodyViaPandoc(filteredHtml);
      const fullTex = memoirDoc({ title, bodyLatex });

      fs.writeFileSync(texPath, fullTex, "utf-8");

      execFileSync("xelatex", ["-halt-on-error", "-interaction=nonstopmode", `${slug}.tex`], {
        cwd: jobDir,
        stdio: "inherit",
      });

      if (!fs.existsSync(pdfPath)) throw new Error("xelatex did not produce a PDF");
      fs.copyFileSync(pdfPath, outPdf);

      console.log(`  ✓ Created pdfs/${slug}.pdf\n`);
      ok++;
    } catch (e) {
      console.error(`  ✗ Failed for ${slug}: ${e.message}`);
      console.error(`  ↳ Temp dir (inspect .log): ${jobDir}\n`);
      fail++;
    }
  }

  console.log(`Done. ${ok} PDFs created, ${skipped} skipped, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main();