import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Draggable from 'react-draggable';

import { SubtitleObserver } from '../services/SubtitleObserver';
import { translateText } from '../services/TranslationService';

console.log('Netflix Parallel Translation: Content script loaded (v1.1.5)');

const HOST_ID = 'netflix-parallel-translation-host';

// Ensure the host element exists in the DOM
let host = document.getElementById(HOST_ID);
if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.style.position = 'fixed'; // Fixed ensures overlay stays on screen
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100vw'; // Viewport units
    host.style.height = '100vh';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '2147483647'; // Max Z-Index

    // Initial append (will be moved by init logic if needed)
    document.body.appendChild(host);
    console.log('Shadow host initially appended to body');
}

// Create Shadow DOM
let shadowRoot = host.shadowRoot;
if (!shadowRoot) {
    shadowRoot = host.attachShadow({ mode: 'open' });
}

// Inject Styles into Shadow DOM (Manually fetching CSS from extension assets)
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = chrome.runtime.getURL('assets/content.css');
shadowRoot.appendChild(styleLink);

// Helper to split text into words and separators
const tokenize = (text: string) => {
    // Split by non-word characters but keep delimiters
    // Using a simple regex for now that captures whitespace/punctuation as separate tokens
    return text.split(/([^\p{L}\p{N}]+)/u).filter(t => t);
};

const Tooltip = ({ text, x, y, visible }: { text: string, x: number, y: number, visible: boolean }) => {
    if (!visible || !text) return null;
    return (
        <div style={{
            position: 'fixed',
            left: x,
            top: y,
            transform: 'translate(-50%, -100%) translateY(-8px)',
            backgroundColor: '#1f2937', // slate-800
            color: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 2147483647,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            border: '1px solid #374151',
            whiteSpace: 'nowrap',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }}>
            {text}
            {/* Tiny arrow */}
            <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                backgroundColor: '#1f2937',
                borderRight: '1px solid #374151',
                borderBottom: '1px solid #374151'
            }} />
        </div>
    );
};

const App = () => {
    const [original, setOriginal] = useState<string>('');
    const [translated, setTranslated] = useState<string>('');
    const [settings, setSettings] = useState({
        targetLang: 'ru',
        enabled: true,
        fontSize: 28,
        color: '#ffff00'
    });

    // Hover State
    const [hoveredWord, setHoveredWord] = useState<string | null>(null);
    const [tooltipText, setTooltipText] = useState<string>('');
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const hoverTimeoutRef = useRef<any>(null);

    // Refs for safe access
    const settingsRef = useRef(settings);
    const nodeRef = useRef(null);

    useEffect(() => { settingsRef.current = settings; }, [settings]);

    useEffect(() => {
        chrome.storage.local.get(['targetLang', 'enabled', 'fontSize', 'color'], (result) => {
            setSettings(prev => ({
                ...prev,
                targetLang: result.targetLang || prev.targetLang,
                enabled: result.enabled !== undefined ? result.enabled : prev.enabled,
                fontSize: result.fontSize || prev.fontSize,
                color: result.color || prev.color
            }));
        });

        const messageListener = (request: any) => {
            if (request.action === 'updateSettings') {
                setSettings(prev => {
                    const next = { ...prev, ...request.payload };
                    if (request.payload.enabled === false) setTranslated('');
                    return next;
                });
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);

        const observer = new SubtitleObserver(async (text) => {
            setOriginal(text);
            const current = settingsRef.current;

            if (!text || !text.trim() || !current.enabled) {
                setTranslated('');
                return;
            }

            try {
                const trans = await translateText(text, 'auto', current.targetLang);
                if (settingsRef.current.enabled) setTranslated(trans);
            } catch (err: any) {
                if (settingsRef.current.enabled) {
                    const errMsg = err.message || String(err);
                    setTranslated(errMsg.includes('context invalidated') ? '⚠️ Please Reload' : 'Err: ' + errMsg);
                }
            }
        });
        observer.start();

        return () => {
            observer.stop();
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    useEffect(() => {
        if (original && settings.enabled) {
            translateText(original, 'auto', settings.targetLang)
                .then(t => { if (settings.enabled) setTranslated(t); })
                .catch(e => console.error(e));
        }
    }, [settings.targetLang, settings.enabled]);

    // Handle Word Hover
    const handleWordEnter = (word: string, e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top;

        setTooltipPos({ x: centerX, y: topY });
        setHoveredWord(word);
        setTooltipText('...'); // Loading state

        // Clear previous pending translation
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        // Debounce slightly to avoid spam
        hoverTimeoutRef.current = setTimeout(async () => {
            try {
                // Logic: Translate FROM current targetLang TO 'en' (or 'ru' if target is 'en')
                const fromLang = settings.targetLang;
                const toLang = fromLang === 'ru' ? 'en' : 'ru'; // Simple toggle for now

                const translation = await translateText(word, fromLang, toLang);
                setTooltipText(translation);
            } catch (err) {
                setTooltipText('?');
            }
        }, 300);
    };

    const handleWordLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredWord(null);
        setTooltipText('');
    };

    const isVisible = (original && settings.enabled && translated);
    const tokens = isVisible ? tokenize(translated) : [];

    return (
        <div style={{ pointerEvents: 'none', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Draggable nodeRef={nodeRef} bounds="parent" defaultPosition={{ x: window.innerWidth / 2 - 200, y: window.innerHeight - 150 }}>
                <div ref={nodeRef} style={{
                    position: 'absolute',
                    cursor: 'move',
                    pointerEvents: isVisible ? 'auto' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '80%',
                    zIndex: 2147483640,
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.2s',
                    // Center the box horizontally around the drag coordinate (x,y)
                    // If x=ScreenCenter, this centers the box exactly in the middle.
                    transform: 'translateX(-50%)'
                }}>
                    <div style={{
                        color: settings.color,
                        fontSize: `${settings.fontSize}px`,
                        fontWeight: '700',
                        textAlign: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                        fontFamily: '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        userSelect: 'text',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4'
                    }}>
                        {tokens.map((token, i) => {
                            // Only make "words" interactive (letters/numbers)
                            const isWord = /^[\p{L}\p{N}]+$/u.test(token);
                            if (!isWord) return <span key={i}>{token}</span>;

                            return (
                                <span
                                    key={i}
                                    onMouseEnter={(e) => handleWordEnter(token, e)}
                                    onMouseLeave={handleWordLeave}
                                    style={{
                                        cursor: 'help',
                                        borderBottom: hoveredWord === token ? '2px solid rgba(255,255,255,0.5)' : 'none',
                                        transition: 'border-bottom 0.2s'
                                    }}
                                >
                                    {token}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </Draggable>

            <Tooltip
                text={tooltipText}
                x={tooltipPos.x}
                y={tooltipPos.y}
                visible={!!hoveredWord}
            />
        </div>
    );
};

// Render logic
const init = () => {
    console.log('Netflix Parallel Translation: Init started');

    // Robustly find the Netflix player container or fallback to body
    const findPlayer = () => {
        const p1 = document.querySelector('.watch-video--player-view');
        const p2 = document.querySelector('.nfp-planning-layer');
        const p3 = document.querySelector('.sizing-wrapper');

        if (p1) console.log('Found .watch-video--player-view');
        if (p2) console.log('Found .nfp-planning-layer');
        if (p3) console.log('Found .sizing-wrapper');

        return p1 || p2 || p3 || document.body;
    };

    const attemptMount = () => {
        const player = findPlayer();
        if (player) {
            // Ensure host is attached to the found container
            if (host.parentElement !== player) {
                player.appendChild(host);
                console.log('Netflix Parallel Translation: Host mounted to', player === document.body ? 'BODY (Fallback)' : 'PLAYER CONTAINER');
            }

            // Render React if not already rendered
            if (!shadowRoot.getElementById('react-root-mount')) {
                const rootDiv = document.createElement('div');
                rootDiv.id = 'react-root-mount';
                shadowRoot.appendChild(rootDiv);

                const root = createRoot(rootDiv);
                root.render(<App />);
                console.log('React App Rendered');
            }
        } else {
            console.log('No container found (retry in 1s)');
            setTimeout(attemptMount, 1000);
        }
    };

    // Keep trying to keep it mounted (SPA navigation fix)
    setInterval(attemptMount, 2000);
    attemptMount();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
