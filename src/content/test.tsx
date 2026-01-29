import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('Netflix Parallel Translation: Content script loaded');

const rootId = 'netflix-parallel-translation-root';
let rootDiv = document.getElementById(rootId);

if (!rootDiv) {
    rootDiv = document.createElement('div');
    rootDiv.id = rootId;
    document.body.appendChild(rootDiv);
}

const App = () => {
    return React.createElement('div', {
        style: {
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 9999,
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            fontSize: '20px'
        }
    }, 'EXT ACTIVE: Ready to Translate (Manual Build)');
};

const root = createRoot(rootDiv);
root.render(React.createElement(App));
