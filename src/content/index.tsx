import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { SubtitleObserver } from '../services/SubtitleObserver';

console.log('Netflix Parallel Translation: Content script loaded (v1.0.2)');

const rootId = 'netflix-parallel-translation-root';

try {
    let rootDiv = document.getElementById(rootId);
    if (!rootDiv) {
        rootDiv = document.createElement('div');
        rootDiv.id = rootId;
        document.body.appendChild(rootDiv);
        console.log('Root div created appended to body');
    }

    const App = () => {
        const [original, setOriginal] = useState<string>('');
        const [translated, setTranslated] = useState<string>('Waiting...');

        useEffect(() => {
            const observer = new SubtitleObserver(async (text) => {
                console.log('Original::', text);
                setOriginal(text);
                try {
                    // Use 'auto' -> 'en' (or 'ru' since user speaks Russian? Defaulting to 'en' from legacy)
                    // Legacy had hardcoded defaults, I will stick to 'en' for now, selectable later
                    const trans = await translateText(text, 'auto', 'ru');
                    console.log('Translated:', trans);
                    setTranslated(trans);
                } catch (err) {
                    console.error('Translation fail:', err);
                    setTranslated('Error...');
                }
            });
            observer.start();
            return () => observer.stop();
        }, []);

        if (!original) return null;

        return (
            <div style={{
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2147483647,
                textAlign: 'center',
                fontFamily: 'Netflix Sans, Helvetica Neue, Helvetica, Arial, sans-serif',
                pointerEvents: 'none'
            }}>
                {/* Helper box to verify translation flow */}
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: '#e50914', // Default Netflix RED for original debug
                    padding: '8px 12px',
                    fontSize: '18px',
                    marginBottom: '4px',
                    borderRadius: '4px',
                }}>{original}</div>

                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: '#ffff00', // Yellow as requested
                    padding: '10px 14px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    textShadow: '2px 2px 2px #000'
                }}>{translated}</div>
            </div>
        );
    };

    const root = createRoot(rootDiv);
    root.render(<App />);
    console.log('React root rendered');

} catch (err) {
    console.error('CRITICAL ERROR in Content Script:', err);
}
