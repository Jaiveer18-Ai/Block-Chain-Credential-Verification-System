import { useState, useEffect } from 'react';

export const useScrollReveal = (options = { threshold: 0.1, triggerOnce: true }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [element, setElement] = useState(null);

    useEffect(() => {
        // Respect prefers-reduced-motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            setIsVisible(true);
            return;
        }

        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (options.triggerOnce) {
                    observer.disconnect();
                }
            } else if (!options.triggerOnce) {
                setIsVisible(false);
            }
        }, { threshold: options.threshold });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element, options.threshold, options.triggerOnce]);

    return { ref: setElement, isVisible };
};
