const fs = require('fs');
const path = require('path');

const POSTS_PATH = path.join(__dirname, '../posts.json');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');
const DOMAIN = 'https://alessandrosblog.it.eu.org';

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function formatDate(dateStr) {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
}

function generateSitemap() {
    const isDryRun = process.argv.includes('--dry-run');

    console.log('Reading posts from:', POSTS_PATH);
    const postsData = JSON.parse(fs.readFileSync(POSTS_PATH, 'utf8'));

    if (!postsData.posts || !Array.isArray(postsData.posts)) {
        console.error('Error: posts.json must contain a top-level "posts" array.');
        process.exit(1);
    }

    const posts = postsData.posts;
    const urls = [];
    let hashCount = 0;
    let htmlCount = 0;

    // Homepage
    urls.push({
        loc: `${DOMAIN}/`,
        changefreq: 'daily',
        priority: '1.0'
    });

    // Privacy
    urls.push({
        loc: `${DOMAIN}/#privacy`,
        changefreq: 'monthly',
        priority: '0.3'
    });

    // Posts
    // Sort by publishedAt newest first for stable ordering
    posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    for (const post of posts) {
        if (!post.slug) {
            console.warn(`Warning: Post missing slug: "${post.title}"`);
            continue;
        }

        const updatedAt = post.updatedAt || post.publishedAt;
        const lastMod = formatDate(updatedAt);

        // Check availability of static HTML file
        const htmlPath = path.join(__dirname, `../posts/${post.slug}.html`);
        let loc;
        if (fs.existsSync(htmlPath)) {
            loc = `${DOMAIN}/posts/${post.slug}.html`;
            htmlCount++;
        } else {
            loc = `${DOMAIN}/#post/${post.slug}`;
            hashCount++;
        }

        urls.push({
            loc: loc,
            lastmod: lastMod,
            changefreq: 'weekly',
            priority: '0.8'
        });
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const url of urls) {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
        if (url.lastmod) {
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        }
        // Consistent with Google guidance, priority and changefreq are optional/ignored but requested in prompt spec or existing file had them.
        // User spec said "Do NOT include <priority> or <changefreq> (Google ignores them)". 
        // BUT current sitemap.xml has them. 
        // Re-reading User Request: "Do NOT include <priority> or <changefreq> (Google ignores them)."
        // Okay, strictly following user constraints overrides existing file style.
        // I will remove them from the XML output loop.

        xml += '  </url>\n';
    }

    xml += '</urlset>';

    if (isDryRun) {
        console.log('--- Dry Run Output ---');
        console.log(xml);
        console.log('--- End Dry Run ---');
    } else {
        fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
        console.log(`Sitemap written to ${SITEMAP_PATH}`);
    }

    console.log(`Summary:`);
    console.log(`  Total URLs: ${urls.length}`);
    console.log(`  Static HTML routes: ${htmlCount}`);
    console.log(`  Hash routes: ${hashCount}`);
}

generateSitemap();
