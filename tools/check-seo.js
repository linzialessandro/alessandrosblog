#!/usr/bin/env node
'use strict';

/**
 * SEO readiness checks for the Unlock-the-Blog surface.
 * Exit 0 if healthy; exit 1 with diagnostics otherwise.
 *
 * Manual follow-up (cannot automate without your Google account):
 *  1. Google Search Console → add property https://alessandrosblog.it.eu.org/
 *  2. Verify ownership (DNS TXT or HTML file)
 *  3. Sitemaps → submit https://alessandrosblog.it.eu.org/sitemap.xml
 *  4. URL Inspection → test a few posts/{slug}.html pages
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'https://alessandrosblog.it.eu.org';
const errors = [];
const warnings = [];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function main() {
  if (!exists('posts.json')) errors.push('posts.json missing');
  if (!exists('sitemap.xml')) errors.push('sitemap.xml missing');
  if (!exists('feed.xml')) errors.push('feed.xml missing');
  if (!exists('robots.txt')) errors.push('robots.txt missing');
  if (!exists('index.html')) errors.push('index.html missing');
  if (!exists('assets/og/default.png')) errors.push('assets/og/default.png missing — run scripts/build-og-images.py');

  const posts = JSON.parse(read('posts.json')).posts || [];
  const sitemap = exists('sitemap.xml') ? read('sitemap.xml') : '';
  const feed = exists('feed.xml') ? read('feed.xml') : '';
  const indexHtml = exists('index.html') ? read('index.html') : '';
  const robots = exists('robots.txt') ? read('robots.txt') : '';

  if (robots && !robots.includes('Sitemap:')) {
    errors.push('robots.txt missing Sitemap directive');
  }
  if (indexHtml && !indexHtml.includes('application/atom+xml')) {
    errors.push('index.html missing Atom alternate link');
  }
  if (indexHtml && !indexHtml.includes('application/ld+json')) {
    errors.push('index.html missing JSON-LD');
  }
  if (indexHtml && !indexHtml.includes('SearchAction')) {
    warnings.push('index.html WebSite JSON-LD has no SearchAction');
  }
  if (indexHtml && !indexHtml.includes('og:image')) {
    warnings.push('index.html missing og:image');
  }

  let missingHtml = 0;
  let missingOg = 0;
  let missingSitemap = 0;
  let missingJsonLd = 0;
  let missingOgImageMeta = 0;

  for (const post of posts) {
    const slug = post.slug;
    if (!slug) {
      errors.push(`Post without slug: ${post.title || '?'}`);
      continue;
    }
    const htmlRel = `posts/${slug}.html`;
    const ogRel = `assets/og/${slug}.png`;
    const loc = `${DOMAIN}/posts/${slug}.html`;

    if (!exists(htmlRel)) {
      missingHtml++;
      if (missingHtml <= 5) errors.push(`Missing static page: ${htmlRel}`);
      continue;
    }
    if (!exists(ogRel)) {
      missingOg++;
      if (missingOg <= 5) errors.push(`Missing OG image: ${ogRel}`);
    }
    if (sitemap && !sitemap.includes(loc)) {
      missingSitemap++;
      if (missingSitemap <= 5) errors.push(`Sitemap missing: ${loc}`);
    }

    const html = read(htmlRel);
    if (!html.includes('application/ld+json')) {
      missingJsonLd++;
      if (missingJsonLd <= 3) errors.push(`No JSON-LD in ${htmlRel}`);
    }
    if (!html.includes('og:image')) {
      missingOgImageMeta++;
      if (missingOgImageMeta <= 3) errors.push(`No og:image meta in ${htmlRel}`);
    }
    if (!html.includes('rel="canonical"')) {
      warnings.push(`No canonical in ${htmlRel}`);
    }
  }

  if (missingHtml > 5) errors.push(`…and ${missingHtml - 5} more missing static pages`);
  if (missingOg > 5) errors.push(`…and ${missingOg - 5} more missing OG images`);
  if (feed && !feed.includes('<feed')) errors.push('feed.xml does not look like Atom');

  console.log('SEO readiness check');
  console.log(`  Posts: ${posts.length}`);
  console.log(`  Static HTML gaps: ${missingHtml}`);
  console.log(`  OG image gaps: ${missingOg}`);
  console.log(`  Sitemap gaps: ${missingSitemap}`);

  if (warnings.length) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  WARN  ${w}`);
  }

  if (errors.length) {
    console.log('\nErrors:');
    for (const e of errors) console.log(`  ERROR ${e}`);
    console.log('\nManual harvest (after green check):');
    console.log('  1. Search Console → property for https://alessandrosblog.it.eu.org/');
    console.log('  2. Verify ownership');
    console.log(`  3. Submit sitemap ${DOMAIN}/sitemap.xml`);
    console.log('  4. Inspect a few /posts/{slug}.html URLs');
    process.exit(1);
  }

  console.log('\nOK — on-repo SEO surface looks complete.');
  console.log('Still do manually in Google Search Console:');
  console.log(`  • Submit ${DOMAIN}/sitemap.xml`);
  console.log('  • URL Inspection on a few static post pages');
  process.exit(0);
}

main();
