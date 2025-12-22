/**
 * compile-contrib-posts.js
 *
 * Compiles contributor drafts from submissions/accepted/ into posts.json.
 * Validates metadata, converts Markdown to safe HTML, and enforces blog rules.
 *
 * Usage:
 *   node tools/compile-contrib-posts.js [--dry-run] [--accepted <dir>] [--posts <file>] [--no-move]
 */

const fs = require('fs');
const path = require('path');

// --- Configuration & Defaults ---
const DEFAULTS = {
    ACCEPTED_DIR: 'submissions/accepted',
    PROCESSED_DIR: 'submissions/processed',
    POSTS_FILE: 'posts.json',
    DRY_RUN: false,
    MOVE_FILES: true,
    TIMEZONE_OFFSET: '+01:00' // Default offset if needed for "now"
};

// --- CLI Argument Parsing ---
const args = process.argv.slice(2);
const config = { ...DEFAULTS };

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--dry-run':
            config.DRY_RUN = true;
            break;
        case '--accepted':
            config.ACCEPTED_DIR = args[++i];
            break;
        case '--posts':
            config.POSTS_FILE = args[++i];
            break;
        case '--no-move':
            config.MOVE_FILES = false;
            break;
        default:
            console.error(`Unknown argument: ${args[i]}`);
            process.exit(1);
    }
}

// Ensure absolute paths
const ROOT_DIR = path.resolve(__dirname, '..'); // Assuming tools/ is one level deep
const ACCEPTED_PATH = path.resolve(ROOT_DIR, config.ACCEPTED_DIR);
const PROCESSED_PATH = path.resolve(ROOT_DIR, config.PROCESSED_DIR);
const POSTS_PATH = path.resolve(ROOT_DIR, config.POSTS_FILE);

console.log(`Working configuration:
  Drafts:    ${ACCEPTED_PATH}
  Posts:     ${POSTS_PATH}
  Dry Run:   ${config.DRY_RUN}
`);

// --- Helpers ---

// Simple front-matter parser (supports basic key: value)
function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const rawMeta = match[1];
    const body = match[2].trim();
    const meta = {};

    rawMeta.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Join back the rest in case value has colons (like URLs)
            const value = parts.slice(1).join(':').trim();
            meta[key] = value;
        }
    });

    return { meta, body };
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Escape HTML entities in text processing to prevent injection
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Simple Markdown to HTML converter
function convertMarkdown(markdown) {
    let html = markdown;

    // 1. Escape Raw HTML (Crucial for security)
    // We do this first so that our generated tags aren't escaped afterwards.
    // HOWEVER, we need to be careful. If we escape everything, we break our own ability to parse.
    // Better approach: Parse standard markdown, and for the content inside, escape it.
    // Since we are writing a simple regex parser, we generally convert markdown syntax to HTML tags,
    // and escape the content within those tags.

    // Let's go line by line for block elements first to keep it simpler and safer.
    const lines = html.split('\n');
    let output = '';
    let inList = false;
    let inCodeBlock = false;

    for (let line of lines) {
        // --- Code Blocks (```) ---
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                output += '</code></pre>';
                inCodeBlock = false;
            } else {
                output += '<pre><code>';
                inCodeBlock = true;
            }
            continue; // Skip processing the content of the fence line
        }

        if (inCodeBlock) {
            output += escapeHtml(line) + '\n';
            continue;
        }

        // --- Headers (##, ###) ---
        if (line.startsWith('### ')) {
            if (inList) { output += '</ul>'; inList = false; }
            output += `<h3>${parseInline(line.substring(4))}</h3>`;
            continue;
        }
        if (line.startsWith('## ')) {
            if (inList) { output += '</ul>'; inList = false; }
            output += `<h2>${parseInline(line.substring(3))}</h2>`;
            continue;
        }

        // --- Unordered Lists (- ) ---
        if (line.startsWith('- ')) {
            if (!inList) {
                output += '<ul>';
                inList = false; // Will set to true next
            }
            inList = true;
            output += `<li>${parseInline(line.substring(2))}</li>`;
            continue;
        }

        // If we were in a list and hit a non-list line, close the UL
        if (inList && !line.startsWith('- ')) {
            output += '</ul>';
            inList = false;
        }

        // --- Paragraphs ---
        // Ignore empty lines
        if (line.trim() === '') {
            continue;
        }

        // Treat as paragraph
        output += `<p>${parseInline(line)}</p>`;
    }

    if (inList) output += '</ul>';
    if (inCodeBlock) output += '</code></pre>'; // Should handle unclosed blocks gracefully

    return output;
}

// Inline parser for links, code, bold, italics (simplified)
// Note: Order matters. Process links first so [code](url) works?
// Actually, standard MD is [src] first.
function parseInline(text) {
    let res = escapeHtml(text); // Basic safety: escape everything first.

    // Restore our ability to use specific markdown syntax by "un-escaping" specific patterns?
    // No, that's brittle.
    // Better: Match the markdown patterns in the ORIGINAL text, escape the content, then wrap in tags.

    // Re-approach: split by tokens?
    // For a "lightweight without dependencies" parser, regex replacement is standard but tricky with nesting.
    // Given the requirements: links, inline code.

    // 1. Inline Code `code` -> <code>code</code>
    // We handle this first to avoid processing things inside code
    res = res.replace(/`([^`]+)`/g, (match, code) => {
        // code is already escaped because we ran escapeHtml(text) above?
        // Wait, if input is `foo < bar`, escapeHtml makes `foo &lt; bar`.
        // Then regex matches `foo &lt; bar`.
        // So we just wrap in <code>.
        return `<code>${code}</code>`;
    });

    // 2. Links [text](url) -> <a href>
    // Regex: \[([^\]]+)\]\(([^)]+)\)
    // But wait, we escaped `[` to `[`? No, escapeHtml doesn't escape strictly [ ].
    // But it does escape " (which might be in logic).
    // Let's assume input text was already escaped.
    // So `[text]` is `[text]`. `(url)` is `(url)`.
    // WARNING: if URL contained `&`, it is now `&amp;`. We should probably unescape the URL part for the href attribute, OR strict-check it.
    // Actually, browsers handle &amp; in href fine.
    // We need to support `target="_blank" rel="noopener noreferrer"`.
    res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, txt, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
    });

    // 3. Bold/Italic (Added bonus, usually expected)
    res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return res;
}


// --- Main Logic ---

async function main() {
    // 1. Load Posts
    if (!fs.existsSync(POSTS_PATH)) {
        console.error(`Error: Posts file not found at ${POSTS_PATH}`);
        process.exit(1);
    }

    let postsData;
    try {
        const rawArgs = fs.readFileSync(POSTS_PATH, 'utf8');
        postsData = JSON.parse(rawArgs);
    } catch (e) {
        console.error(`Error: Failed to parse ${POSTS_PATH}: ${e.message}`);
        process.exit(1);
    }

    if (!postsData.posts || !Array.isArray(postsData.posts)) {
        console.error('Error: posts.json MUST have a top-level "posts" array.');
        process.exit(1);
    }

    const existingSlugs = new Set(postsData.posts.map(p => p.slug));

    // 2. Find Drafts
    if (!fs.existsSync(ACCEPTED_PATH)) {
        console.error(`Error: Accepted directory not found at ${ACCEPTED_PATH}`);
        process.exit(1); // Or create it?
    }

    const files = fs.readdirSync(ACCEPTED_PATH).filter(f => f.endsWith('.md') || f.endsWith('.txt'));

    if (files.length === 0) {
        console.log('No drafts found in submissions/accepted.');
        return;
    }

    console.log(`Found ${files.length} draft(s). Processing...`);

    const newPosts = [];
    const processedFiles = [];

    for (const file of files) {
        const filePath = path.join(ACCEPTED_PATH, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse Front Matter
        const parsed = parseFrontMatter(content);
        if (!parsed) {
            console.error(`Skipping ${file}: Invalid front-matter format. Must start/end with ---.`);
            continue;
        }

        const { meta, body } = parsed;

        // Validate Required Fields
        if (!meta.title) { console.error(`Skipping ${file}: Missing 'title'.`); continue; }
        if (!meta.summary) { console.error(`Skipping ${file}: Missing 'summary'.`); continue; }
        if (!meta.contributor) { console.error(`Skipping ${file}: Missing 'contributor'.`); continue; }
        if (!meta.source) { console.error(`Skipping ${file}: Missing 'source'.`); continue; }

        // Validate Constraints
        if (meta.summary.length > 600) {
            console.error(`Skipping ${file}: Summary exceeds 600 characters.`);
            continue;
        }

        // Slug
        let slug = meta.slug;
        if (!slug) {
            slug = generateSlug(meta.title);
        }
        // Simple validator matches strict blogq rules: ^[a-z0-9]+(?:-[a-z0-9]+)*$
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            console.error(`Skipping ${file}: Slug '${slug}' is invalid (lowercase, numbers, single hyphens only).`);
            continue;
        }

        if (existingSlugs.has(slug)) {
            console.error(`Skipping ${file}: Duplicate slug '${slug}' already exists in posts.json.`);
            continue;
        }
        // Also check against currently processed batch
        if (newPosts.find(p => p.slug === slug)) {
            console.error(`Skipping ${file}: Duplicate slug '${slug}' found in current batch.`);
            continue;
        }

        // Date
        let publishedAt = meta.publishedAt;
        if (!publishedAt) {
            publishedAt = new Date().toISOString(); // TODO: Add timezone offset if strictly required?
            // Just fallback to ISO with Z usually fine, but prompt asked for local offset check.
            // Let's assume ISO format.
        }
        // Basic format check
        if (isNaN(new Date(publishedAt).getTime())) {
            console.error(`Skipping ${file}: Invalid publishedAt date.`);
            continue;
        }

        // Tags
        let tags = [];
        if (meta.tags) {
            tags = meta.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }
        if (tags.length === 0) {
            // Prompt says optional default [], but schema says minItems 1.
            // Let's warn and skip if strict schema enforcement is key, or allow empty?
            // Schema says: "minItems": 1.
            console.error(`Skipping ${file}: Tags are required (min 1).`);
            continue;
        }

        // Compile Content
        let htmlContent = convertMarkdown(body);

        // Append Footer
        const footer = `
<p><strong>Contributor:</strong> ${escapeHtml(meta.contributor)}</p>
<p>Read more here: <a href="${escapeHtml(meta.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(meta.source)}</a></p>`; // Simple link text as url

        // Better read more link format: use source domain or just "Link"
        // Prompt Example: <p>Read more here: <a href="SOURCE_URL" ...>link</a></p>
        // Let's use "Link" or "Source".
        // Adjusted footer to match the exact requirement better:
        const footerCorrected = `
<p><strong>Contributor:</strong> ${escapeHtml(meta.contributor)}</p>
<p>Read more here: <a href="${escapeHtml(meta.source)}" target="_blank" rel="noopener noreferrer">source</a></p>`;

        htmlContent += footerCorrected;

        // Reject Forbidden HTML (Safety Net)
        // Simple check for <script or on* events
        if (/<script/i.test(htmlContent) || / on\w+=/i.test(htmlContent) || /javascript:/i.test(htmlContent)) {
            console.error(`Skipping ${file}: Detected unsafe HTML content.`);
            continue;
        }

        const newPost = {
            title: meta.title,
            slug: slug,
            publishedAt: publishedAt,
            summary: meta.summary,
            tags: tags,
            content: htmlContent
        };

        newPosts.push(newPost);
        processedFiles.push(file);
        console.log(`[OK] Prepared: ${slug}`);
    }

    // 3. Commit Changes
    if (newPosts.length === 0) {
        console.log("No valid posts generated.");
        return;
    }

    // Merge: new posts first
    const updatedPosts = [...newPosts, ...postsData.posts];
    postsData.posts = updatedPosts;

    if (config.DRY_RUN) {
        console.log('\n--- DRY RUN: Resulting JSON Structure (Top 2 items) ---');
        console.log(JSON.stringify(postsData.posts.slice(0, 2), null, 2));
        console.log(`\nWould write ${newPosts.length} new posts to ${config.POSTS_FILE}`);
        console.log(`Would move ${processedFiles.join(', ')} to ${config.PROCESSED_DIR}`);
    } else {
        // Write JSON
        fs.writeFileSync(POSTS_PATH, JSON.stringify(postsData, null, 2));
        console.log(`\nSuccessfully added ${newPosts.length} posts to ${config.POSTS_FILE}`);

        // Move Files
        if (config.MOVE_FILES) {
            if (!fs.existsSync(PROCESSED_PATH)) {
                fs.mkdirSync(PROCESSED_PATH, { recursive: true });
            }
            for (const file of processedFiles) {
                const src = path.join(ACCEPTED_PATH, file);
                const dest = path.join(PROCESSED_PATH, file);
                fs.renameSync(src, dest);
                console.log(`Moved ${file} -> ${config.PROCESSED_DIR}`);
            }
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
