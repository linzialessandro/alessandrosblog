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

    // Reusable Modal Logic
    const setupModal = (modalId, openBtnId, closeBtnId, exploreBtnId, footerCloseBtnId) => {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const exploreBtn = document.getElementById(exploreBtnId);
        const footerCloseBtn = document.getElementById(footerCloseBtnId);
        
        if (!modal || !openBtn || !closeBtn) return;
        
        const sections = modal.querySelectorAll('.scroll-reveal');

        const observerOptions = {
            root: modal,
            rootMargin: '-30% 0px -30% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, observerOptions);

        const openModal = (e) => {
            if (e) e.preventDefault();
            modal.scrollTop = 0;
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            sections.forEach(section => {
                section.classList.remove('in-view');
                sectionObserver.observe(section);
            });
        };

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            sections.forEach(section => {
                sectionObserver.unobserve(section);
            });
        };

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeModal);

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                const abstractSection = modal.querySelector('.bts-abstract');
                if (abstractSection) {
                    abstractSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Return the closeModal function so we can hook it into the global Escape listener
        return closeModal;
    };

    const closeBtsModal = setupModal('btsModal', 'btsOpenBtn', 'btsCloseBtn', 'btsExploreBtn', 'btsFooterCloseBtn');
    const closeContributeModal = setupModal('contributeModal', 'contributeOpenBtn', 'contributeCloseBtn', 'contributeExploreBtn', 'contributeFooterCloseBtn');

    // Close open modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('btsModal')?.classList.contains('open') && closeBtsModal) closeBtsModal();
            if (document.getElementById('contributeModal')?.classList.contains('open') && closeContributeModal) closeContributeModal();
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
