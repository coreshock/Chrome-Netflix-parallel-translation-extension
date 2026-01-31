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
    host.style.position = 'absolute';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100%';
    host.style.height = '100%';
    host.style.pointerEvents = 'none'; // Let clicks pass through to Netflix player
    host.style.zIndex = '99999';

    // Try to append to the Netflix full-screen player container if possible, otherwise body
    const netflixPlayer = document.querySelector('.nfp-planning-layer') || document.body;
    netflixPlayer.appendChild(host);
    console.log('Shadow host appended to:', netflixPlayer);
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

const App = () => {
    const [original, setOriginal] = useState<string>('');
    const [translated, setTranslated] = useState<string>('');
    const [settings, setSettings] = useState({
        targetLang: 'ru',
        enabled: true,
        fontSize: 28,
        color: '#ffff00'
    });

    // Refs for safe access inside callbacks
    const settingsRef = useRef(settings);
    const nodeRef = useRef(null);

    // Keep ref in sync with state
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        // Load settings initially
        chrome.storage.local.get(['targetLang', 'enabled', 'fontSize', 'color'], (result) => {
            setSettings(prev => ({
                ...prev,
                targetLang: result.targetLang || prev.targetLang,
                enabled: result.enabled !== undefined ? result.enabled : prev.enabled,
                fontSize: result.fontSize || prev.fontSize,
                color: result.color || prev.color
            }));
        });

        // Listen for setting changes
        const messageListener = (request: any, sender: any, sendResponse: any) => {
            if (request.action === 'updateSettings') {
                console.log('Settings updated:', request.payload);
                setSettings(prev => {
                    const next = { ...prev, ...request.payload };
                    // Clear translation if disabled
                    if (request.payload.enabled === false) setTranslated('');
                    return next;
                });

                // Trigger re-translation if we have text and just enabled/changed language
                // access new values from payload + prev state logic is tricky in async
                // Simple approach: if enabled is true in payload or (current true and not changing), rely on effect or just let next mutation handle it.
                // Actually, the easiest way is to re-run translation if language changed.
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);

        const observer = new SubtitleObserver(async (text) => {
            setOriginal(text);

            // Access latest settings via Ref
            const current = settingsRef.current;

            if (!text || !text.trim() || !current.enabled) {
                setTranslated('');
                return;
            }

            try {
                const trans = await translateText(text, 'auto', current.targetLang);
                if (settingsRef.current.enabled) setTranslated(trans);
            } catch (err) {
                if (settingsRef.current.enabled) {
                    const errMsg = (err instanceof Error ? err.message : String(err));
                    if (errMsg.includes('Extension context invalidated') || errMsg.includes('reload')) {
                        setTranslated('⚠️ Update Installed. Please Reload Page.');
                    } else {
                        setTranslated('Err: ' + errMsg);
                    }
                }
            }
        });
        observer.start();

        return () => {
            observer.stop();
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []); // Hook only runs once, internal logic relies on refs/setters

    // Re-trigger translation when settings that affect output logic change (Language)
    // We can't easily re-run the observer's callback, but we can manually triggering translation if we have 'original'.
    useEffect(() => {
        if (original && settings.enabled) {
            translateText(original, 'auto', settings.targetLang)
                .then(t => { if (settings.enabled) setTranslated(t); })
                .catch(e => console.error(e));
        }
    }, [settings.targetLang, settings.enabled]);


    const isVisible = (original && settings.enabled && translated);

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
                    width: 'fit-content',
                    maxWidth: '80%',
                    zIndex: 2147483647,
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out'
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
                        whiteSpace: 'pre-wrap'
                    }}>
                        {translated}
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

// Render logic
const rootDiv = document.createElement('div');
rootDiv.id = 'react-root';
shadowRoot.appendChild(rootDiv);

const root = createRoot(rootDiv);
root.render(<App />);
console.log('React app rendered in Shadow DOM');
