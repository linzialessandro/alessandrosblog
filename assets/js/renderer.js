// assets/js/renderer.js

export class Renderer {
    constructor(router) {
        this.router = router;
        
        // DOM Elements
        this.HOMEPAGE       = document.getElementById("homepage");
        this.POSTPAGE       = document.getElementById("postpage");
        this.PRIVACYPAGE    = document.getElementById("privacypage");
        this.POSTSLIST      = document.getElementById("postsList");
        this.THEMETOGGLE    = document.getElementById("themeToggle");
        this.FILTERBUTTON   = document.getElementById("filterButton");
        this.FILTERBADGE    = document.getElementById("filterBadge");
        this.FILTERPOPOVER  = document.getElementById("filterPopover");
        this.FILTERCHIPS    = document.getElementById("filterChips");
        this.TAGSEARCH      = document.getElementById("tagSearch");
        this.CLEARCOMPACT   = document.getElementById("clearFiltersCompact");
        this.CLEARPOPOVER   = document.getElementById("clearFiltersPopover");
        this.FILTERCOUNT    = document.getElementById("filterCountCompact");

        this.isPopoverOpen = false;
        this.tagSearchQuery = "";
        
        this._bindEvents();
    }
    
    // Inject router later to break cyclic dependency during initialization
    setRouter(router) {
        this.router = router;
    }

    _bindEvents() {
        // Theme toggle
        this.THEMETOGGLE.addEventListener("click", () => {
            const next = (localStorage.getItem("theme") || "light") === "dark" ? "light" : "dark";
            this.applyTheme(next);
        });

        // Filter popover
        this.FILTERBUTTON.addEventListener("click", e => { 
            e.stopPropagation(); 
            this.togglePopover(); 
        });
        
        this.TAGSEARCH.addEventListener("input", e => { 
            this.tagSearchQuery = e.target.value; 
            // We need a reference to the store to re-render chips, 
            // but the store state hasn't changed. We can just call renderChips
            // with the current store instance. We'll pass it when needed or keep a ref.
            if (this.currentStore) this.renderChips(this.currentStore);
        });

        const clearAll = () => {
            if (this.router) this.router.updateTagsHash([]);
        };
        
        this.CLEARCOMPACT.addEventListener("click", clearAll);
        this.CLEARPOPOVER.addEventListener("click", clearAll);

        document.addEventListener("click", e => {
            if (this.isPopoverOpen && !this.FILTERPOPOVER.contains(e.target) && e.target !== this.FILTERBUTTON) {
                this.closePopover();
            }
        });
        
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.isPopoverOpen) { 
                this.closePopover(); 
                this.FILTERBUTTON.focus(); 
            }
        });
    }

    /* ── Theme ── */
    initTheme() {
        const stored = localStorage.getItem("theme");
        const sys    = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const theme  = stored || sys;
        this.applyTheme(theme);
    }

    applyTheme(t) {
        t === "dark"
            ? document.documentElement.setAttribute("data-theme", "dark")
            : document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", t);
        this.THEMETOGGLE.textContent = t === "dark" ? "☀️" : "🌙";
    }

    /* ── View Transitions ── */
    showView(viewId) {
        this.HOMEPAGE.style.display    = viewId === 'homepage' ? "block" : "none";
        this.POSTPAGE.style.display    = viewId === 'postpage' ? "block" : "none";
        this.PRIVACYPAGE.style.display = viewId === 'privacypage' ? "block" : "none";
    }

    /* ── Helpers ── */
    esc(t) {
        const d = document.createElement("div"); 
        d.textContent = t ?? ""; 
        return d.innerHTML;
    }
    
    fmt(s) {
        if (!s) return "";
        const d = new Date(s);
        return isNaN(d) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    }
    
    pdfUrl(slug) { return `/assets/pdfs/${slug}.pdf`; }
    
    txt(html) { 
        const d = document.createElement("div"); 
        d.innerHTML = html; 
        return (d.textContent || "").replace(/\s+/g, " ").trim(); 
    }
    
    words(t) { return t ? t.trim().split(/\s+/).length : 0; }
    mins(w, r = 200) { return Math.max(1, Math.round(w / r)); }

    /* ── Popover ── */
    openPopover() { 
        this.isPopoverOpen = true; 
        this.FILTERPOPOVER.style.display = "block"; 
        setTimeout(() => this.FILTERPOPOVER.classList.add("open"), 10); 
        this.FILTERBUTTON.setAttribute("aria-expanded", "true"); 
        this.TAGSEARCH.focus(); 
    }
    
    closePopover() { 
        this.isPopoverOpen = false; 
        this.FILTERPOPOVER.classList.remove("open"); 
        setTimeout(() => { if (!this.isPopoverOpen) this.FILTERPOPOVER.style.display = "none"; }, 200); 
        this.FILTERBUTTON.setAttribute("aria-expanded", "false"); 
        this.tagSearchQuery = ""; 
        this.TAGSEARCH.value = ""; 
        if (this.currentStore) this.renderChips(this.currentStore);
    }
    
    togglePopover() { 
        this.isPopoverOpen ? this.closePopover() : this.openPopover(); 
    }

    /* ── Renderers ── */
    renderChips(store) {
        this.currentStore = store;
        const q = this.tagSearchQuery.toLowerCase();
        const allTags = [...store.allTags];
        const visible = q ? allTags.filter(t => t.toLowerCase().includes(q)) : allTags;
        
        if (!visible.length) { 
            this.FILTERCHIPS.innerHTML = '<p style="font-size:.85rem;color:var(--text-3);text-align:center;padding:.5rem">No tags found</p>'; 
            return; 
        }
        
        this.FILTERCHIPS.innerHTML = visible.map(t =>
            `<button class="filter-chip${store.selectedTags.has(t) ? " selected" : ""}" data-tag="${this.esc(t)}" aria-pressed="${store.selectedTags.has(t)}">${this.esc(t)}</button>`
        ).join("");
        
        this.FILTERCHIPS.querySelectorAll(".filter-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const t = chip.dataset.tag;
                
                // Toggle the tag in a copy of the selected tags, then tell the router
                const newTags = new Set(store.selectedTags);
                if (newTags.has(t)) {
                    newTags.delete(t);
                } else {
                    newTags.add(t);
                }
                
                if (this.router) {
                    this.router.updateTagsHash([...newTags]);
                }
            });
        });
    }

    updateFilterUI(store) {
        const n = store.selectedTags.size;
        const shown = store.getFilteredPosts().length;
        const total = store.posts.length;
        
        this.FILTERBADGE.textContent = n; 
        this.FILTERBADGE.style.display = n ? "inline-block" : "none";
        this.CLEARCOMPACT.style.display = n ? "inline-block" : "none";
        this.FILTERCOUNT.textContent = n ? `${shown} of ${total}` : "";
    }

    renderHomepage(store) {
        this.currentStore = store;
        this.renderChips(store);
        this.updateFilterUI(store);

        const fp = store.getFilteredPosts();
        if (!fp.length) { 
            this.POSTSLIST.innerHTML = "<p>No posts match the selected filters.</p>"; 
            return; 
        }
        
        this.POSTSLIST.innerHTML = fp.map(p => {
            const tags = (p.tags || []).map(t => `<span class="tag">${this.esc(t)}</span>`).join("");
            return `
            <li class="post-card">
                <a href="#post/${encodeURIComponent(p.slug)}" style="text-decoration:none;color:inherit;display:block;">
                    <div class="post-meta">
                        <span class="post-date">${this.fmt(store._pub(p))}</span>
                        ${tags ? `<div class="post-tags">${tags}</div>` : ""}
                    </div>
                    <h3 class="post-title">${this.esc(p.title)}</h3>
                    <p class="post-summary">${this.esc(p.summary)}</p>
                </a>
            </li>`;
        }).join("");
    }

    async renderPostPage(store, slug) {
        const post = store.getPost(slug);
        if (!post) { 
            this.POSTPAGE.innerHTML = "<p>Post not found.</p>"; 
            return; 
        }
        
        try {
            let content = post.content;
            if (!content) {
                const r = await fetch(`posts/${slug}.html`, { cache: "no-store" });
                if (!r.ok) throw new Error();
                content = await r.text();
            }
            
            const idx = store.getPostIndex(post);
            const prev = idx < store.posts.length - 1 ? store.getPostByIndex(idx + 1) : null;
            const next = idx > 0 ? store.getPostByIndex(idx - 1) : null;
            const w = this.words(this.txt(content));
            const rel = store.getRelatedPosts(post);

            this.POSTPAGE.innerHTML = `
            <div class="wrap post-page-wrap">
                <a href="#" class="back-link">← Back to archive</a>
                <article>
                    <header class="post-header">
                        <h1>${this.esc(post.title)}</h1>
                        <div class="post-info">
                            <span>${this.fmt(store._pub(post))}</span>
                            ${post.updatedAt || post.updatedat ? `<span>Updated ${this.fmt(post.updatedAt || post.updatedat)}</span>` : ""}
                            <span>${this.mins(w)} min read</span>
                            <span>${w.toLocaleString()} words</span>
                        </div>
                    </header>
                    <div class="post-content">${content}</div>
                    <div class="pdf-download">
                        <a href="${this.pdfUrl(slug)}" target="_blank" rel="noopener noreferrer">Download PDF Version</a>
                    </div>
                </article>
                ${rel.length ? `
                <aside class="related-posts" aria-label="Related posts">
                    <h2>Related Reading</h2>
                    <ul>${rel.map(r => `
                        <li><a href="#post/${encodeURIComponent(r.slug)}">
                            <div class="related-meta">${this.fmt(store._pub(r))}</div>
                            <div class="related-title">${this.esc(r.title)}</div>
                        </a></li>`).join("")}
                    </ul>
                </aside>` : ""}
                <nav class="post-nav" aria-label="Post navigation">
                    ${prev
                        ? `<a href="#post/${encodeURIComponent(prev.slug)}" class="nav-item"><div class="nav-label">Previous</div><div class="nav-title">${this.esc(prev.title)}</div></a>`
                        : `<div class="nav-item disabled"><div class="nav-label">Previous</div><div class="nav-title">—</div></div>`}
                    ${next
                        ? `<a href="#post/${encodeURIComponent(next.slug)}" class="nav-item"><div class="nav-label">Next</div><div class="nav-title">${this.esc(next.title)}</div></a>`
                        : `<div class="nav-item disabled"><div class="nav-label">Next</div><div class="nav-title">—</div></div>`}
                </nav>
            </div>`;
            window.scrollTo(0, 0);
        } catch {
            this.POSTPAGE.innerHTML = "<p>Error loading post.</p>";
        }
    }
}
