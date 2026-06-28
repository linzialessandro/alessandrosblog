// assets/js/store.js

const POSTSFILE = "posts.json";

export class BlogStore {
    constructor() {
        this.posts = [];
        this.allTags = new Set();
        this.selectedTags = new Set();
        this.listeners = [];
    }

    onChange(callback) {
        this.listeners.push(callback);
    }

    _notify() {
        this.listeners.forEach(cb => cb(this));
    }

    async load() {
        try {
            const r = await fetch(POSTSFILE, { cache: "no-store" });
            if (!r.ok) throw new Error();
            const data = await r.json();
            const arr = Array.isArray(data) ? data : (data?.posts || []);
            this.posts = arr.slice().sort((a, b) => new Date(this._pub(b)) - new Date(this._pub(a)));
            
            const s = new Set();
            this.posts.forEach(p => (p.tags || []).forEach(t => s.add(t)));
            this.allTags = new Set([...s].sort());
        } catch {
            throw new Error("Error loading posts");
        }
    }

    _pub(p) { 
        return p.publishedAt || p.publishedat || ""; 
    }

    getStoredTags() {
        try { 
            return JSON.parse(localStorage.getItem("selectedTags") || "[]"); 
        } catch { 
            return []; 
        }
    }

    saveStoredTags() {
        try { 
            localStorage.setItem("selectedTags", JSON.stringify([...this.selectedTags])); 
        } catch {}
    }

    setFilter(tags) {
        // filter tags to ensure they exist
        this.selectedTags = new Set(tags.filter(t => this.allTags.has(t)));
        this.saveStoredTags();
        this._notify();
    }

    clearFilter() {
        this.selectedTags.clear();
        this.saveStoredTags();
        this._notify();
    }

    toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        } else {
            this.selectedTags.add(tag);
        }
        this.saveStoredTags();
        this._notify();
    }

    getFilteredPosts() {
        return this.selectedTags.size 
            ? this.posts.filter(p => (p.tags || []).some(t => this.selectedTags.has(t))) 
            : this.posts;
    }

    getPost(slug) {
        return this.posts.find(p => p.slug === slug);
    }

    getPostIndex(post) {
        return this.posts.indexOf(post);
    }

    getPostByIndex(index) {
        return this.posts[index];
    }

    getRelatedPosts(post, max = 3) {
        const ct = post.tags || [];
        let cands = ct.length
            ? this.posts.filter(p => p.slug !== post.slug)
                .map(p => ({ post: p, score: (p.tags || []).filter(t => ct.includes(t)).length }))
                .filter(x => x.score > 0)
                .sort((a, b) => b.score - a.score || new Date(this._pub(b.post)) - new Date(this._pub(a.post)))
                .map(x => x.post)
            : [];
        if (!cands.length) cands = this.posts.filter(p => p.slug !== post.slug);
        return cands.slice(0, max);
    }
}
