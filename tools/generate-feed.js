#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DOMAIN = 'https://alessandrosblog.it.eu.org';
const BLOG_TITLE = "Alessandro's blog";
const BLOG_SUBTITLE = 'Publicly collecting what I learn';
const AUTHOR_NAME = 'Alessandro Linzi';
const MAX_ENTRIES = 20;

// ---------------------------------------------------------------------------
// Paths (relative to this script inside tools/)
// ---------------------------------------------------------------------------
const ROOT_DIR = path.resolve(__dirname, '..');
const POSTS_JSON = path.join(ROOT_DIR, 'posts.json');
const FEED_OUT = path.join(ROOT_DIR, 'feed.xml');
const API_POSTS_DIR = path.join(ROOT_DIR, 'api', 'posts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape special XML characters in text content. */
function escapeXml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Ensure a date value is returned as an ISO 8601 string. */
function toISO(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Try to load the full HTML content for a post from its API JSON file.
 * Returns the HTML string or null if the file doesn't exist / can't be read.
 */
function loadPostContent(slug) {
  const filePath = path.join(API_POSTS_DIR, `${slug}.json`);
  try {
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return typeof data.content === 'string' ? data.content : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Entry builder
// ---------------------------------------------------------------------------

function buildEntry(post) {
  // Extensionless public URL (host redirects *.html → clean path)
  const permalink = `${DOMAIN}/posts/${post.slug}`;
  const published = toISO(post.publishedAt);
  const updated = toISO(post.updatedAt || post.publishedAt);

  const lines = [];
  lines.push('  <entry>');
  lines.push(`    <title>${escapeXml(post.title)}</title>`);
  lines.push(`    <link href="${escapeXml(permalink)}" rel="alternate" type="text/html" />`);
  lines.push(`    <id>${escapeXml(permalink)}</id>`);
  lines.push(`    <published>${published}</published>`);
  lines.push(`    <updated>${updated}</updated>`);
  lines.push(`    <summary>${escapeXml(post.summary || '')}</summary>`);

  // Category tags
  if (Array.isArray(post.tags)) {
    for (const tag of post.tags) {
      lines.push(`    <category term="${escapeXml(tag)}" />`);
    }
  }

  // Content — prefer full HTML from API file, fall back to summary
  const fullContent = loadPostContent(post.slug);
  if (fullContent) {
    lines.push(`    <content type="html"><![CDATA[${fullContent}]]></content>`);
  } else if (post.summary) {
    lines.push(`    <content type="html"><![CDATA[${post.summary}]]></content>`);
  }

  lines.push('  </entry>');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Feed builder
// ---------------------------------------------------------------------------

function buildFeed(posts) {
  // Sort newest first by publishedAt
  const sorted = posts
    .slice()
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, MAX_ENTRIES);

  const feedUpdated = sorted.length > 0
    ? toISO(sorted[0].updatedAt || sorted[0].publishedAt)
    : new Date().toISOString();

  const header = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(BLOG_TITLE)}</title>`,
    `  <subtitle>${escapeXml(BLOG_SUBTITLE)}</subtitle>`,
    `  <link href="${DOMAIN}/" rel="alternate" type="text/html" />`,
    `  <link href="${DOMAIN}/feed.xml" rel="self" type="application/atom+xml" />`,
    `  <id>${DOMAIN}/</id>`,
    `  <updated>${feedUpdated}</updated>`,
    '  <author>',
    `    <name>${escapeXml(AUTHOR_NAME)}</name>`,
    '  </author>',
  ];

  const entries = sorted.map(buildEntry);

  return [...header, ...entries, '</feed>', ''].join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!fs.existsSync(POSTS_JSON)) {
    console.error(`Error: posts.json not found at ${POSTS_JSON}`);
    process.exit(1);
  }

  const postsData = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf-8'));
  const posts = postsData.posts;

  if (!Array.isArray(posts)) {
    console.error('Error: posts.json must contain a "posts" array.');
    process.exit(1);
  }

  const xml = buildFeed(posts);
  const entryCount = Math.min(posts.length, MAX_ENTRIES);

  if (dryRun) {
    process.stdout.write(xml);
  } else {
    fs.writeFileSync(FEED_OUT, xml, 'utf-8');
    console.log(`Atom feed written to feed.xml with ${entryCount} entries.`);
  }
}

main();
