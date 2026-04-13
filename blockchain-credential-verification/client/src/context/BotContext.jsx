import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const BotContext = createContext();

export const BotProvider = ({ children }) => {
    const location = useLocation();
    
    // Preferences & State
    const [isBotEnabled, setIsBotEnabled] = useState(() => {
        const stored = localStorage.getItem('trustmate_enabled');
        return stored !== 'false';
    });
    const [isMinimized, setIsMinimized] = useState(false);
    
    // Behavior tracking
    const [idleTime, setIdleTime] = useState(0);
    const [suggestionsMade, setSuggestionsMade] = useState(0);
    const [activeTarget, setActiveTarget] = useState(null);
    const [lastSuggestionTime, setLastSuggestionTime] = useState(0);
    
    // Page Context Mapping
    const targetMap = {
        '/': 'a[href="/register"]', // Point to register CTA
        '/verify': 'input[type="text"]', // Search bar
        '/login': 'input[type="email"]', // Email field
        '/register': 'input[name="name"]' // Name field
    };

    // Reset tracking on page change
    useEffect(() => {
        setIdleTime(0);
        setSuggestionsMade(0);
        setActiveTarget(null);
    }, [location.pathname]);

    // Idle Tracking
    useEffect(() => {
        if (!isBotEnabled || isMinimized) return;

        let idleTimer;
        let activityDetector;

        const handleActivity = () => {
            setIdleTime(0);
            setActiveTarget(null); // Clear suggestion if active
        };

        const checkIdle = () => {
            setIdleTime((prev) => prev + 1);
        };

        // Attach listeners
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        idleTimer = setInterval(checkIdle, 1000); // ++ every second

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
            clearInterval(idleTimer);
        };
    }, [isBotEnabled, isMinimized]);

    // Evaluation Engine
    useEffect(() => {
        // Trigger logic
        const now = Date.now();
        const IDLE_THRESHOLD = 3; // Reduced from 5s to 3s for higher sensitivity
        const COOLDOWN = 15000; // Reduced from 30s to 15s
        const MAX_SUGGESTIONS = 5; // Increased from 3

        if (
            idleTime >= IDLE_THRESHOLD &&
            suggestionsMade < MAX_SUGGESTIONS &&
            now - lastSuggestionTime > COOLDOWN &&
            !activeTarget
        ) {
            const selector = targetMap[location.pathname];
            if (selector) {
                const element = document.querySelector(selector);
                if (element) {
                    setActiveTarget(element);
                    setSuggestionsMade((prev) => prev + 1);
                    setLastSuggestionTime(now);
                }
            }
        }
    }, [idleTime, suggestionsMade, lastSuggestionTime, activeTarget, location.pathname]);

    const [triggerGreeting, setTriggerGreeting] = useState(false);

    // Haptic Utility
    const vibrate = useCallback((pattern = 10) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            try {
                window.navigator.vibrate(pattern);
            } catch (e) {
                // Ignore vibration errors
            }
        }
    }, []);

    const toggleBot = () => {
        const nextState = !isBotEnabled;
        setIsBotEnabled(nextState);
        localStorage.setItem('trustmate_enabled', nextState.toString());
        if (nextState) {
            setTriggerGreeting(true);
            vibrate([15, 30, 15]); // Snappy haptic pulse
        }
    };

    return (
        <BotContext.Provider value={{
            isBotEnabled,
            toggleBot,
            isMinimized,
            setIsMinimized,
            activeTarget,
            setActiveTarget,
            triggerGreeting,
            setTriggerGreeting,
            vibrate
        }}>
            {children}
        </BotContext.Provider>
    );
};

export const useBotContext = () => useContext(BotContext);
