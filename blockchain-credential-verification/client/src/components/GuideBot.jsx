import { useState, useEffect, useRef } from 'react';
import { useBotContext } from '../context/BotContext';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const GuideBot = () => {
    const { 
        isBotEnabled, toggleBot, isMinimized, setIsMinimized, 
        activeTarget, setActiveTarget, triggerGreeting, setTriggerGreeting,
        vibrate
    } = useBotContext();
    
    // Physics State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, dx: 0, dy: 0, tilt: 0 });
    
    // Emotional State Machine: 'normal' | 'smiling' | 'sad'
    const [expression, setExpressionState] = useState('normal');
    const expressionTimeoutRef = useRef(null);
    
    // Greeting UI State
    const [greeting, setGreeting] = useState('');
    const [showGreeting, setShowGreeting] = useState(false);
    
    const botRef = useRef(null);

    // Bulletproof Expression Setter
    const setExpression = (newExpression, duration = null) => {
        if (expressionTimeoutRef.current) {
            clearTimeout(expressionTimeoutRef.current);
        }
        
        setExpressionState(newExpression);
        
        // Haptic on expression change
        if (newExpression !== 'normal') vibrate(20);
        
        if (duration) {
            expressionTimeoutRef.current = setTimeout(() => {
                setExpressionState('normal');
            }, duration);
        }
    };

    // Greeting System Initialization
    useEffect(() => {
        const executeGreeting = (text) => {
            setGreeting(text);
            setShowGreeting(true);
            setExpression('smiling', 4000); // 4 seconds smile
            
            // Fade out text slightly before expression reverts
            setTimeout(() => {
                setShowGreeting(false);
            }, 3000);
        };

        // First Load Check
        const hasGreeted = localStorage.getItem('botGreetingShown');
        if (!hasGreeted) {
            executeGreeting("Hey! 👋");
            localStorage.setItem('botGreetingShown', 'true');
        }

        // Triggered by manual enable (footer)
        if (triggerGreeting) {
            executeGreeting("I'm back! 😊");
            setTriggerGreeting(false); // Reset context flag
        }
    }, [triggerGreeting, setTriggerGreeting]);

    // Handle Sad State Triggers safely
    const triggerSad = () => setExpression('sad');
    const triggerSadLeave = () => setExpression('normal');

    // Eye Tracker Physics engine
    useEffect(() => {
        if (!botRef.current) return;
        
        let animationFrameId;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };

        const updatePhysics = () => {
            if (botRef.current) {
                const rect = botRef.current.getBoundingClientRect();
                const botX = rect.left + rect.width / 2;
                const botY = rect.top + rect.height / 2;
                
                const dx = targetX - botX;
                const dy = targetY - botY;
                const angle = Math.atan2(dy, dx);
                
                // Pupil clamp increased for higher sensitivity
                const distance = Math.min(10, Math.hypot(dx, dy) / 25); 
                
                // Face Tilt Calculation increased for more dramatic movement
                const clampedTilt = Math.max(-25, Math.min(25, (dx / window.innerWidth) * 50));

                setMousePos({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    dx,
                    dy,
                    tilt: clampedTilt
                });
            }
            animationFrameId = requestAnimationFrame(updatePhysics);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId = requestAnimationFrame(updatePhysics);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Clear Active Target tracking gracefully
    useEffect(() => {
        if (activeTarget) {
            activeTarget.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            activeTarget.style.boxShadow = '0 0 0 4px rgba(212, 160, 83, 0.4), 0 0 20px rgba(212, 160, 83, 0.6)';
            activeTarget.style.transform = 'translateY(-2px)';
            
            const arrowDiv = document.createElement('div');
            arrowDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4a053" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3))"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
            arrowDiv.style.position = 'absolute';
            arrowDiv.style.zIndex = '99999';
            arrowDiv.style.pointerEvents = 'none';
            arrowDiv.style.transition = 'all 0.2s';
            
            const styleGuide = document.createElement('style');
            styleGuide.innerHTML = '@keyframes pointRightAnim { 0% { transform: translateX(0); } 100% { transform: translateX(12px); } }';
            document.head.appendChild(styleGuide);
            arrowDiv.style.animation = 'pointRightAnim 0.6s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)';
            
            const positionArrow = () => {
                const rect = activeTarget.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return; // Hidden
                arrowDiv.style.top = `${rect.top + window.scrollY + (rect.height / 2) - 18}px`;
                // If element is too close to the left, don't clip the arrow
                const shift = Math.max(10, rect.left - 50);
                arrowDiv.style.left = `${shift + window.scrollX}px`;
            };
            
            positionArrow();
            document.body.appendChild(arrowDiv);
            window.addEventListener('resize', positionArrow);
            window.addEventListener('scroll', positionArrow);

            const clearTarget = () => {
                activeTarget.style.boxShadow = '';
                activeTarget.style.transform = '';
                if (arrowDiv.parentNode) arrowDiv.parentNode.removeChild(arrowDiv);
                if (styleGuide.parentNode) styleGuide.parentNode.removeChild(styleGuide);
                window.removeEventListener('resize', positionArrow);
                window.removeEventListener('scroll', positionArrow);
                setActiveTarget(null);
            };
            
            activeTarget.addEventListener('click', clearTarget);
            activeTarget.addEventListener('focus', clearTarget);
            activeTarget.addEventListener('input', clearTarget);

            return () => {
                if (activeTarget) {
                    activeTarget.removeEventListener('click', clearTarget);
                    activeTarget.removeEventListener('focus', clearTarget);
                    activeTarget.removeEventListener('input', clearTarget);
                    activeTarget.style.boxShadow = '';
                    activeTarget.style.transform = '';
                }
                if (arrowDiv.parentNode) arrowDiv.parentNode.removeChild(arrowDiv);
                if (styleGuide.parentNode) styleGuide.parentNode.removeChild(styleGuide);
                window.removeEventListener('resize', positionArrow);
                window.removeEventListener('scroll', positionArrow);
            };
        }
    }, [activeTarget, setActiveTarget]);

    if (!isBotEnabled) return null;

    // Derived Variables based on state hooks
    const isSad = expression === 'sad';
    const isSmiling = expression === 'smiling';
    const isNormal = expression === 'normal';

    return (
        <>
            {/* The Bot Structure */}
            <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 ease-in-out ${activeTarget ? 'scale-110' : 'scale-100'} hover:scale-105`}>
                
                {/* Minimal Greeting Tooltip */}
                <div 
                    className={`absolute bottom-[110%] right-2 mb-2 whitespace-nowrap bg-[#1a1a24]/90 backdrop-blur-md border border-[#d4a053]/30 text-[#e8e4df] text-xs px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(212,160,83,0.2)] transition-all duration-300 transform origin-bottom-right
                    ${showGreeting ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}
                >
                    {greeting}
                </div>

                {/* Bot Body */}
                <div 
                    ref={botRef}
                    className={`relative backdrop-blur-md border outline outline-[#d4a053]/20 outline-1 transition-all duration-300 ease-out flex flex-col items-center justify-center group
                        ${isMinimized ? 'w-16 h-16 rounded-full bg-[#1a1a24]/80 shadow-lg' : 'w-28 h-28 rounded-[2rem] bg-gradient-to-br from-[#1a1a24]/90 to-[#0f0f14]/90 shadow-2xl'}
                        ${activeTarget ? 'animate-float ring-4 ring-primary/40 animate-haptic-bounce' : 'animate-float'}
                        ${isSad ? 'shadow-[0_10px_40px_rgba(0,0,0,0.6)]' : ''}
                        ${isSmiling ? 'shadow-[0_0_50px_rgba(212,160,83,0.5)]' : ''}
                    `}
                    onMouseEnter={() => vibrate(10)}
                >
                    {/* Bot Controls (Hover to reveal) */}
                    <div className={`absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 ${isMinimized ? 'scale-0 pointer-events-none' : 'scale-100'}`}>
                        <button 
                            onClick={() => { setIsMinimized(true); triggerSadLeave(); vibrate(15); }} 
                            onMouseEnter={triggerSad} onMouseLeave={triggerSadLeave}
                            className="p-1 bg-[#2a2a34] hover:bg-[#3a3a44] rounded-full text-[#e8e4df] shadow-md cursor-pointer" aria-label="Minimize bot"
                        >
                            <Minimize2 className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={() => { toggleBot(); triggerSadLeave(); }} 
                            onMouseEnter={triggerSad} onMouseLeave={triggerSadLeave}
                            className="p-1 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full shadow-md cursor-pointer" aria-label="Close bot"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>

                    {isMinimized && (
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                            <button onClick={() => { setIsMinimized(false); vibrate(15); }} className="p-1.5 bg-primary hover:bg-[#b8862e] rounded-full text-[#0f0f14] shadow-md cursor-pointer">
                                <Maximize2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* Bot Face Container (Physics-driven Tilts) */}
                    <div 
                        className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none transition-transform duration-200"
                        style={{ transform: `rotate(${isSad ? -5 : isSmiling ? Math.max(0, mousePos.tilt) : mousePos.tilt}deg) translateY(${isSad ? 5 : isSmiling ? -3 : 0}px)` }}
                    >
                        {/* Shield Crown */}
                        {!isMinimized && (
                            <div className={`absolute top-0 w-10 h-1.5 rounded-b-md transition-all duration-500
                                ${activeTarget ? 'bg-primary w-14' : isSad ? 'bg-[#2a2a34] w-8' : isSmiling ? 'bg-primary w-12 shadow-[0_0_10px_rgba(212,160,83,0.8)]' : 'bg-gradient-to-r from-primary to-secondary'}
                            `}></div>
                        )}
                        
                        {/* Eyebrows Layer */}
                        {!isMinimized && (
                            <div className="absolute top-5 w-full px-5 flex justify-between">
                                {/* Sad angled down, smiling angled up, normal hidden */}
                                <div className={`w-5 h-1.5 bg-[#2a2a34] rounded-full transition-all duration-300 transform 
                                    ${isSad ? 'rotate-[25deg] opacity-100 translate-y-1' : isSmiling ? '-rotate-[15deg] opacity-100 -translate-y-1' : 'opacity-0'}
                                `}></div>
                                <div className={`w-5 h-1.5 bg-[#2a2a34] rounded-full transition-all duration-300 transform 
                                    ${isSad ? '-rotate-[25deg] opacity-100 translate-y-1' : isSmiling ? 'rotate-[15deg] opacity-100 -translate-y-1' : 'opacity-0'}
                                `}></div>
                            </div>
                        )}

                        {/* Animated Prominent Eyes Layer */}
                        <div className={`flex justify-center w-full transition-all duration-300 
                            ${isMinimized ? 'gap-2 mt-0' : isSad ? 'gap-4 mt-4' : isSmiling ? 'gap-6 mt-1' : 'gap-5 mt-2'}
                        `}>
                            {/* Left Sclera */}
                            <div className={`bg-[#e8e4df] rounded-full relative overflow-hidden transition-all duration-300
                                ${isMinimized ? 'w-3 h-3' : isSmiling ? 'w-8 h-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_0_25px_rgba(212,160,83,0.6)]' : 'w-7 h-7 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_0_15px_rgba(212,160,83,0.4)]'}
                                ${isSad ? 'translate-y-1 h-5 rounded-t-sm shadow-[0_0_15px_rgba(212,160,83,0.1)]' : ''}
                            `}>
                                {/* Pupil */}
                                <div className={`absolute bg-gradient-to-br from-amber-600 to-violet-500 rounded-full transition-all duration-100
                                    ${isMinimized ? 'w-2 h-2 top-0.5 left-0.5' : isSad ? 'w-4 h-4 top-1' : isSmiling ? 'w-4 h-4 top-2 left-2' : 'w-3.5 h-3.5 top-1.5 left-1.5'}
                                `} style={{ transform: isSad ? 'translate(2px, 2px)' : `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
                                    
                                    {/* Primary Shine */}
                                    <div className={`bg-white rounded-full absolute top-[15%] right-[20%] transition-all ${isMinimized ? 'w-[2px] h-[2px]' : isSad ? 'w-1h-1 opacity-40' : isSmiling ? 'w-2 h-2 opacity-100' : 'w-1 h-1 shadow-[0_0_5px_white]'}`}></div>
                                    
                                    {/* Secondary Shine (Happiness indicator) */}
                                    {isSmiling && <div className="bg-white rounded-full absolute bottom-[20%] left-[20%] w-1 h-1 opacity-80"></div>}
                                </div>
                            </div>
                            
                            {/* Right Sclera */}
                            <div className={`bg-[#e8e4df] rounded-full relative overflow-hidden transition-all duration-300
                                ${isMinimized ? 'w-3 h-3' : isSmiling ? 'w-8 h-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_0_25px_rgba(212,160,83,0.6)]' : 'w-7 h-7 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_0_15px_rgba(212,160,83,0.4)]'}
                                ${isSad ? 'translate-y-1 h-5 rounded-t-sm shadow-[0_0_15px_rgba(212,160,83,0.1)]' : ''}
                            `}>
                                {/* Pupil */}
                                <div className={`absolute bg-gradient-to-br from-amber-600 to-violet-500 rounded-full transition-all duration-100
                                    ${isMinimized ? 'w-2 h-2 top-0.5 left-0.5' : isSad ? 'w-4 h-4 top-1' : isSmiling ? 'w-4 h-4 top-2 left-2' : 'w-3.5 h-3.5 top-1.5 left-1.5'}
                                `} style={{ transform: isSad ? 'translate(-2px, 2px)' : `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
                                    
                                    {/* Primary Shine */}
                                    <div className={`bg-white rounded-full absolute top-[15%] right-[20%] transition-all ${isMinimized ? 'w-[2px] h-[2px]' : isSad ? 'w-1h-1 opacity-40' : isSmiling ? 'w-2 h-2 opacity-100' : 'w-1 h-1 shadow-[0_0_5px_white]'}`}></div>
                                    
                                    {/* Secondary Shine */}
                                    {isSmiling && <div className="bg-white rounded-full absolute bottom-[20%] left-[20%] w-1 h-1 opacity-80"></div>}
                                </div>
                            </div>

                            {/* Tears Animation overlay (only visible when sad) */}
                            {isSad && !isMinimized && (
                                <div className="absolute inset-0 pointer-events-none fade-in-out-up">
                                    <div className="absolute bg-amber-300 w-1.5 h-2.5 rounded-full left-6 top-10 opacity-70 animate-tear" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="absolute bg-amber-300 w-1 h-2 rounded-full right-6 top-9 opacity-50 animate-tear" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                            )}
                        </div>

                        {/* Blinking Logic overlay */}
                        {isNormal && (
                            <div className="absolute inset-0 flex gap-5 items-center justify-center pointer-events-none mt-2">
                                <div className={`bg-[#1a1a24] rounded-lg transition-all ${isMinimized ? 'hidden' : 'w-8 h-0'}`} style={{ animation: 'blinkHeavy 4.5s infinite' }}></div>
                                <div className={`bg-[#1a1a24] rounded-lg transition-all ${isMinimized ? 'hidden' : 'w-8 h-0'}`} style={{ animation: 'blinkHeavy 4.5s infinite' }}></div>
                            </div>
                        )}

                        {/* Expressive Mouth */}
                        {!isMinimized && (
                            <div className={`border-b-[3px] rounded-full transition-all duration-300
                                ${isSad ? 'border-t-[3px] border-b-0 border-[#57534e] w-3 h-2 mt-5 bg-transparent' : 
                                isSmiling ? 'border-primary w-7 h-4 mt-3 bg-transparent' : 
                                activeTarget ? 'w-8 h-3 mt-4 border-primary' : 'w-4 h-1.5 mt-5 border-[#57534e] opacity-60'}
                            `}></div>
                        )}
                    </div>
                </div>

                {/* Sub-label */}
                {!isMinimized && (
                    <div className="mt-3 text-[10px] font-black text-primary w-full text-center uppercase tracking-widest bg-[#1a1a24]/50 px-2 py-1 rounded-full backdrop-blur-sm border border-[#d4a053]/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        TrustMate AI
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes blinkHeavy {
                    0%, 96%, 98%, 100% { height: 0; opacity: 0; }
                    97% { height: 30px; opacity: 1; transform: translateY(-3px); }
                }
                @keyframes tearDrop {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    20% { transform: translateY(5px) scale(1.2); opacity: 0.8; }
                    80% { transform: translateY(15px) scale(0.8); opacity: 0; }
                    100% { opacity: 0; }
                }
                .animate-tear {
                    animation: tearDrop 2s infinite ease-in;
                }
            `}} />
        </>
    );
};

export default GuideBot;
