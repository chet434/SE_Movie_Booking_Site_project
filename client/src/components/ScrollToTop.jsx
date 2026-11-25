import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * - When location.hash is empty: ensures every route navigation immediately resets scroll position to the top.
 * - When location.hash is present (e.g. #premieres-section): does NOT force scroll to 0,
 *   instead scrolls the target element into view, retrying briefly via requestAnimationFrame/setTimeout
 *   while target pages or asynchronous components mount.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // 1. Hash is present -> Scroll target element into view without forcing top: 0
    if (hash) {
      const targetId = hash.slice(1);
      let attempts = 0;
      const maxAttempts = 30; // 30 * 40ms = 1.2s max retry window
      let cancelled = false;

      const tryScrollToElement = () => {
        if (cancelled) return;
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(tryScrollToElement, 40);
        }
      };

      // Start attempt on next animation frame
      requestAnimationFrame(tryScrollToElement);

      return () => {
        cancelled = true;
      };
    }

    // 2. Hash is empty -> Always reset scroll to the very top
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const scrollContainers = document.querySelectorAll(
      'main, #root, .seat-selection-container, .cb-layout-wrapper, .modal-open'
    );
    scrollContainers.forEach((container) => {
      if (container && container.scrollTop !== undefined) {
        container.scrollTop = 0;
      }
    });
  }, [pathname, search, hash]);

  return null;
}
