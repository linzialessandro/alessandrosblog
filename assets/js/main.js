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

    // Behind The Scenes Modal Logic
    const btsOpenBtn = document.getElementById('btsOpenBtn');
    const btsCloseBtn = document.getElementById('btsCloseBtn');
    const btsModal = document.getElementById('btsModal');
    const btsSections = document.querySelectorAll('.scroll-reveal');

    const observerOptions = {
        root: btsModal,
        rootMargin: '-30% 0px -30% 0px', // Trigger activation near viewport center
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view'); // Fade out when leaving center
            }
        });
    }, observerOptions);

    if (btsOpenBtn && btsCloseBtn && btsModal) {
        btsOpenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            btsModal.scrollTop = 0; // Reset scroll position
            btsModal.classList.add('open');
            btsModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Start observing sections
            btsSections.forEach(section => {
                section.classList.remove('in-view'); // Reset for repeat opens
                sectionObserver.observe(section);
            });
        });

        const btsExploreBtn = document.getElementById('btsExploreBtn');
        if (btsExploreBtn) {
            btsExploreBtn.addEventListener('click', () => {
                const abstractSection = document.querySelector('.bts-abstract');
                if (abstractSection) {
                    abstractSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        const closeModal = () => {
            btsModal.classList.remove('open');
            btsModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Stop observing
            btsSections.forEach(section => {
                sectionObserver.unobserve(section);
            });
        };

        btsCloseBtn.addEventListener('click', closeModal);

        const btsFooterCloseBtn = document.getElementById('btsFooterCloseBtn');
        if (btsFooterCloseBtn) {
            btsFooterCloseBtn.addEventListener('click', closeModal);
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && btsModal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    try {
        await store.load();
        // Initialize routing to show correct view based on URL
        router.init();
    } catch (e) {
        document.getElementById("postsList").innerHTML = "<p>Error loading posts. Please try again later.</p>";
    }
})();
