const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const postsFile = path.join(rootDir, 'posts.json');
const apiDir = path.join(rootDir, 'api', 'posts');

// Ensure api directories exist
if (!fs.existsSync(path.join(rootDir, 'api'))) {
    fs.mkdirSync(path.join(rootDir, 'api'));
}
if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir);
}

try {
    const rawData = fs.readFileSync(postsFile, 'utf8');
    const data = JSON.parse(rawData);
    const posts = data.posts || [];

    // Create index.json with metadata only
    const indexPosts = posts.map(post => {
        return {
            title: post.title,
            slug: post.slug,
            publishedAt: post.publishedAt,
            summary: post.summary,
            tags: post.tags,
            source: post.source,
            contributor: post.contributor
        };
    });

    fs.writeFileSync(
        path.join(rootDir, 'api', 'index.json'),
        JSON.stringify({ posts: indexPosts })
    );

    console.log(`Generated api/index.json with ${indexPosts.length} posts metadata.`);

    // Create individual post JSON files
    let createdCount = 0;
    posts.forEach(post => {
        if (post.slug) {
            const postFilePath = path.join(apiDir, `${post.slug}.json`);
            fs.writeFileSync(postFilePath, JSON.stringify(post));
            createdCount++;
        }
    });

    console.log(`Generated ${createdCount} individual post files in api/posts/`);

} catch (err) {
    console.error('Error building static API:', err);
    process.exit(1);
}
