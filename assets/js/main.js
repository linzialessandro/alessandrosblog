// assets/js/main.js

import { BlogStore } from './store.js';
import { Renderer } from './renderer.js';
import { Router } from './router.js';

(async () => {
    const store = new BlogStore();
    const renderer = new Renderer();
    const router = new Router();
    
    let currentRoute = { view: 'homepage' };

    // Wire up events
    renderer.onFilterToggle = (tag) => {
        const nextTags = store.calculateToggledTags(tag);
        router.updateTagsHash(nextTags);
    };

    renderer.onClearFilters = () => {
        router.updateTagsHash([]);
    };

    router.onRoute = async (state) => {
        currentRoute = state;
        const updateDOM = async () => {
            renderer.showView(state.view);
            if (state.view === 'postpage') {
                await renderer.renderPostPage(store, state.slug);
            } else if (state.view === 'privacypage') {
                window.scrollTo(0, 0);
            } else if (state.view === 'homepage') {
                if (state.empty) {
                    const storedTags = store.getStoredTags();
                    if (storedTags.length > 0) {
                        router.updateTagsHash(storedTags);
                        return; // hash change will re-trigger route
                    } else {
                        store.setFilter([]);
                    }
                } else {
                    store.setFilter(state.tags);
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
    };

    // Initialize UI themes
    renderer.initTheme();

    // Whenever store changes (e.g. from Router, or other events), tell renderer to update homepage
    store.onChange((updatedStore) => {
        if (currentRoute.view === 'homepage') {
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
