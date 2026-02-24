import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css'; // Global Tailwind

const LANGUAGES = [
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'pl', name: 'Polish' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' }
];

const Popup = () => {
    const [targetLang, setTargetLang] = useState('ru');
    const [enabled, setEnabled] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Load saved settings
        chrome.storage.local.get(['targetLang', 'enabled'], (result) => {
            if (result.targetLang) setTargetLang(result.targetLang);
            if (result.enabled !== undefined) setEnabled(result.enabled);
        });
    }, []);

    const saveSettings = (newLang: string, newEnabled: boolean) => {
        chrome.storage.local.set({ targetLang: newLang, enabled: newEnabled }, () => {
            setStatus('Saved!');
            setTimeout(() => setStatus(''), 2000);

            // Notify content script to update immediately
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateSettings',
                        payload: { targetLang: newLang, enabled: newEnabled }
                    });
                }
            });
        });
    };

    return (
        <div className="w-64 p-4 bg-gray-900 text-white font-sans">
            <h1 className="text-xl font-bold mb-4 text-red-600">Netflix Translator</h1>

            <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                            setEnabled(e.target.checked);
                            saveSettings(targetLang, e.target.checked);
                        }}
                        className="form-checkbox h-5 w-5 text-red-600"
                    />
                    <span>Enable Translation</span>
                </label>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Target Language</label>
                <select
                    value={targetLang}
                    onChange={(e) => {
                        setTargetLang(e.target.value);
                        saveSettings(e.target.value, enabled);
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-red-500"
                    disabled={!enabled}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
            </div>

            <div className="text-xs text-center text-gray-500 mt-4">
                {status || 'Parallel Translation Extension v1.2'}
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
}
