// assets/js/router.js

export class Router {
    constructor(store, renderer) {
        this.store = store;
        this.renderer = renderer;
        
        window.addEventListener("hashchange", () => this.route());
    }

    init() {
        this.route();
    }

    route() {
        const hash = location.hash.slice(1);
        
        if (hash.startsWith("post/")) {
            const slug = decodeURIComponent(hash.slice(5));
            this.renderer.showView('postpage');
            this.renderer.renderPostPage(this.store, slug);
            return;
        }
        
        if (hash === "privacy") {
            this.renderer.showView('privacypage');
            window.scrollTo(0, 0);
            return;
        }

        // Default to Homepage
        this.renderer.showView('homepage');
        
        if (hash.startsWith("tags=")) {
            const tags = hash.slice(5).split(",").filter(Boolean);
            this.store.setFilter(tags);
        } else if (hash === "") {
            // Restore from local storage if no hash provided
            const storedTags = this.store.getStoredTags();
            if (storedTags.length > 0) {
                // We update the hash, which will trigger route() again, 
                // but this time with tags=...
                this.updateTagsHash(storedTags);
                return; // exit current route handle
            } else {
                this.store.setFilter([]);
            }
        }
    }

    updateTagsHash(tagsArray) {
        if (tagsArray.length > 0) {
            location.hash = `tags=${tagsArray.join(",")}`;
        } else {
            // Push state to clear hash without scrolling to top
            history.pushState("", document.title, window.location.pathname + window.location.search);
            this.route(); // manually trigger since pushState doesn't fire hashchange
        }
    }
}
