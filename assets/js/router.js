// assets/js/router.js

export class Router {
    constructor() {
        this.onRoute = null;
        window.addEventListener("hashchange", () => this.route());
    }

    init() {
        this.route();
    }

    async route() {
        const hash = location.hash.slice(1);
        let state;

        if (hash.startsWith("post/")) {
            const slug = decodeURIComponent(hash.slice(5));
            state = { view: 'postpage', slug };
        } else if (hash === "privacy") {
            state = { view: 'privacypage' };
        } else if (hash.startsWith("tags=")) {
            const tags = hash.slice(5).split(",").map(decodeURIComponent).filter(Boolean);
            state = { view: 'homepage', tags };
        } else {
            state = { view: 'homepage', empty: true };
        }

        if (this.onRoute) {
            await this.onRoute(state);
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
