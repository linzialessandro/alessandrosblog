const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../posts.json');
const OUTPUT_DIR = path.join(__dirname, '../posts');
const BUILD_ID_FILE = path.join(__dirname, '../assets/js/build-id.js');
const SITE_URL = 'https://alessandrosblog.it.eu.org';

function readBuildId() {
  try {
    const src = fs.readFileSync(BUILD_ID_FILE, 'utf8');
    const m = src.match(/BUILD_ID\s*=\s*["']([^"']+)["']/);
    return m ? m[1] : '0';
  } catch {
    return '0';
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Ensure fenced/pre blocks are Prism-friendly when no language class is set. */
function prepareContent(html) {
  if (!html) return '';
  return html.replace(/<pre([^>]*)>\s*<code([^>]*)>/gi, (match, preAttrs, codeAttrs) => {
    if (/class\s*=\s*["'][^"']*language-/.test(codeAttrs) || /class\s*=\s*["'][^"']*language-/.test(preAttrs)) {
      return match;
    }
    const nextCode = /class\s*=/.test(codeAttrs)
      ? codeAttrs.replace(/class\s*=\s*(["'])/i, 'class=$1language-none ')
      : `${codeAttrs} class="language-none"`;
    return `<pre${preAttrs}><code${nextCode}>`;
  });
}

function generateHtml(post, buildId) {
  const canonicalUrl = `${SITE_URL}/posts/${post.slug}.html`;
  const ogImageUrl = `${SITE_URL}/assets/og/${post.slug}.png`;
  const summaryText = escapeHtml((post.summary || '').substring(0, 160));
  const titleText = escapeHtml(post.title);
  const publishedTime = post.publishedAt || '';
  const modifiedTime = post.updatedAt || publishedTime;
  const v = encodeURIComponent(buildId);

  const tagsHtml = (post.tags || [])
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('');

  const metaTagsHtml = (post.tags || [])
    .map((tag) => `  <meta property="article:tag" content="${escapeHtml(tag)}">`)
    .join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image: [ogImageUrl],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Person',
      name: 'Alessandro Linzi',
    },
    publisher: {
      '@type': 'Person',
      name: 'Alessandro Linzi',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const content = prepareContent(post.content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText} — Alessandro's blog</title>
  <meta name="description" content="${summaryText}">

  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..600;1,9..40,300..600&family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="../assets/css/style.css?v=${v}">
  <link rel="stylesheet" href="../assets/css/static-post.css?v=${v}">
  <link id="prism-theme" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css">

  <!-- Open Graph -->
  <meta property="og:title" content="${titleText}">
  <meta property="og:description" content="${summaryText}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Alessandro's blog">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titleText}">
  <meta name="twitter:description" content="${summaryText}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Article Meta -->
  <meta property="article:published_time" content="${escapeHtml(publishedTime)}">
  <meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">
${metaTagsHtml}

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body class="static-post">
  <nav class="site-nav" aria-label="Site navigation">
    <div class="wrap">
      <a href="/" class="nav-brand" style="display:flex;align-items:center;gap:0.85rem;text-decoration:none;color:inherit;">
        <img src="../assets/logo.png" alt="" class="nav-avatar">
        <span class="nav-name">Alessandro's blog</span>
      </a>
    </div>
  </nav>

  <main class="static-main">
    <div class="wrap post-page-wrap">
      <noscript>
        <div class="noscript-note">
          Static version of this post.
          <a href="/#post/${escapeHtml(post.slug)}">Open the interactive blog</a> if you enable JavaScript.
        </div>
      </noscript>

      <article>
        <header class="post-header">
          <h1>${titleText}</h1>
          <div class="post-info">
            <time datetime="${escapeHtml(publishedTime)}">${formatDate(publishedTime)}</time>
            ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ''}
          </div>
        </header>

        <div class="post-content">
          ${content}
        </div>
      </article>

      <div class="read-more">
        <a href="/#post/${escapeHtml(post.slug)}">View on blog →</a>
      </div>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-css.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-clike.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js"></script>
  <script>
    (function () {
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var link = document.getElementById('prism-theme');
      if (link) {
        link.href = dark
          ? 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css'
          : 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
      }
      if (window.Prism) Prism.highlightAll();
    })();
  </script>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Data file not found at ${DATA_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse posts.json:', err);
    process.exit(1);
  }

  const posts = data.posts || [];
  const buildId = readBuildId();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let generatedCount = 0;

  for (const post of posts) {
    if (!post.slug) {
      console.warn('Skipping post with no slug:', post.title);
      continue;
    }

    const html = generateHtml(post, buildId);
    const outputPath = path.join(OUTPUT_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, html, 'utf-8');
    generatedCount++;
  }

  console.log(`Generated ${generatedCount} static pages in posts/ (BUILD_ID=${buildId})`);
}

main();
