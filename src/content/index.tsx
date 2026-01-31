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
    const targetLang = useRef('ru');
    const isEnabled = useRef(true); // Ref to track enabled state without re-renders affecting logic flow excessively
    const nodeRef = useRef(null);

    useEffect(() => {
        // Load settings initially
        chrome.storage.local.get(['targetLang', 'enabled'], (result) => {
            if (result.targetLang) targetLang.current = result.targetLang;
            if (result.enabled !== undefined) isEnabled.current = result.enabled;
        });

        // Listen for setting changes
        const messageListener = (request: any, sender: any, sendResponse: any) => {
            if (request.action === 'updateSettings') {
                console.log('Settings updated:', request.payload);
                if (request.payload.targetLang) targetLang.current = request.payload.targetLang;
                if (request.payload.enabled !== undefined) {
                    isEnabled.current = request.payload.enabled;
                    // Clear translation immediately if disabled
                    if (!isEnabled.current) setTranslated('');
                }

                // Trigger re-translation if enabled and we have text
                if (isEnabled.current && original) {
                    translateText(original, 'auto', targetLang.current)
                        .then(setTranslated)
                        .catch(err => setTranslated('Err: ' + String(err)));
                }
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);

        const observer = new SubtitleObserver(async (text) => {
            setOriginal(text);

            // If empty text or Disabled, clear translation
            if (!text || !text.trim() || !isEnabled.current) {
                setTranslated('');
                return;
            }

            try {
                const trans = await translateText(text, 'auto', targetLang.current);
                if (isEnabled.current) setTranslated(trans);
            } catch (err) {
                if (isEnabled.current) {
                    const errMsg = (err instanceof Error ? err.message : String(err));
                    if (errMsg.includes('Extension context invalidated') || errMsg.includes('reload')) {
                        setTranslated('⚠️ Update Installed. Please Reload Page.');
                        // Add some visual style for the error? The default yellow text is fine, maybe add red later.
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
    }, [original]); // Keeping original dependency for re-translation logic if needed, though observer handles stream

    // Don't unmount Draggable, just hide content if no translation/original
    // actually, we want to hide if there is no *translated* text to show (or original if debugging)
    // If we return null, Draggable resets. So we must always return the Draggable structure.

    const isVisible = (original && isEnabled.current && translated);

    return (
        <div style={{ pointerEvents: 'none', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            {/* 
                bounds="parent" limits to screen. 
                We keep this mounted even if empty.
            */}
            <Draggable nodeRef={nodeRef} bounds="parent" defaultPosition={{ x: window.innerWidth / 2 - 200, y: window.innerHeight - 150 }}>
                <div ref={nodeRef} style={{
                    position: 'absolute',
                    cursor: 'move',
                    pointerEvents: isVisible ? 'auto' : 'none', // Only clickable when visible
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 'fit-content',
                    maxWidth: '80%',
                    zIndex: 2147483647,
                    opacity: isVisible ? 1 : 0, // Visually hide but keep in DOM for position persistence
                    transition: 'opacity 0.2s ease-in-out'
                }}>
                    <div style={{
                        color: '#ffff00',
                        fontSize: '28px',
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
