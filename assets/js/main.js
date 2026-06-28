// assets/js/main.js

import { BlogStore } from './store.js';
import { Renderer } from './renderer.js';
import { Router } from './router.js';

(async () => {
    const store = new BlogStore();
    const renderer = new Renderer();
    const router = new Router(store, renderer);
    
    // Wire up circular dependency (renderer needs router to update tags)
    renderer.setRouter(router);

    // Initialize UI themes
    renderer.initTheme();

    // Whenever store changes (e.g. from Router, or other events), tell renderer to update homepage
    store.onChange((updatedStore) => {
        // Only render homepage if we are on it (URL is empty or tags)
        const hash = location.hash.slice(1);
        if (!hash.startsWith("post/") && hash !== "privacy") {
            renderer.renderHomepage(updatedStore);
        }
    });

    try {
        await store.load();
        // Initialize routing to show correct view based on URL
        router.init();
    } catch (e) {
        document.getElementById("postsList").innerHTML = "<p>Error loading posts. Please try again later.</p>";
    }
})();
