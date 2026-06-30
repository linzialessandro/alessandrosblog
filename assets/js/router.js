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

    async route() {
        const hash = location.hash.slice(1);
        
        const updateDOM = async () => {
            if (hash.startsWith("post/")) {
                const slug = decodeURIComponent(hash.slice(5));
                this.renderer.showView('postpage');
                await this.renderer.renderPostPage(this.store, slug);
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
                const storedTags = this.store.getStoredTags();
                if (storedTags.length > 0) {
                    this.updateTagsHash(storedTags);
                    return;
                } else {
                    this.store.setFilter([]);
                }
            }
        };

        if (!document.startViewTransition) {
            await updateDOM();
        } else {
            document.startViewTransition(async () => {
                await updateDOM();
            });
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
