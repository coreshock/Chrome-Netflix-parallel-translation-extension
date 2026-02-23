import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const LANGUAGES = [
    { code: 'ru', name: 'Russian' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' },
    { code: 'pl', name: 'Polish' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simp)' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' }
];

const PRESET_COLORS = [
    '#ffff00', // Yellow (Default)
    '#ffffff', // White
    '#00ff00', // Green
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ff0000', // Red
];

const Popup = () => {
    const [targetLang, setTargetLang] = useState('ru');
    const [hoverTargetLang, setHoverTargetLang] = useState('auto');
    const [enabled, setEnabled] = useState(true);
    const [fontSize, setFontSize] = useState(28);
    const [color, setColor] = useState('#ffff00');
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Load saved settings
        chrome.storage.local.get(['targetLang', 'hoverTargetLang', 'enabled', 'fontSize', 'color'], (result: any) => {
            if (result.targetLang) setTargetLang(result.targetLang);
            if (result.hoverTargetLang) setHoverTargetLang(result.hoverTargetLang);
            if (result.enabled !== undefined) setEnabled(result.enabled);
            if (result.fontSize) setFontSize(result.fontSize);
            if (result.color) setColor(result.color);
        });
    }, []);

    const saveSettings = (updates: any) => {
        const newState = { targetLang, hoverTargetLang, enabled, fontSize, color, ...updates };

        // Update local state first for responsiveness
        if (updates.targetLang) setTargetLang(updates.targetLang);
        if (updates.hoverTargetLang) setHoverTargetLang(updates.hoverTargetLang);
        if (updates.enabled !== undefined) setEnabled(updates.enabled);
        if (updates.fontSize) setFontSize(updates.fontSize);
        if (updates.color) setColor(updates.color);

        chrome.storage.local.set(updates, () => {
            // Notify content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateSettings',
                        payload: updates
                    });
                }
            });
        });
    };

    return (
        <div className="w-[320px] min-h-[400px] bg-[#1a1b1e] text-slate-100 font-sans overflow-hidden shadow-2xl selection:bg-red-500 selection:text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 p-4 shadow-lg flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-3 text-white">
                    <span className="text-2xl">文A</span>
                    <span>Netflix Translator</span>
                </h1>
                <div className="text-[10px] opacity-75 font-mono">
                    v{chrome?.runtime?.getManifest?.()?.version || '1.3.2'}
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Enable Switch */}
                <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-[15px]">Enable Translation</span>
                    <button
                        onClick={() => saveSettings({ enabled: !enabled })}
                        className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1a1b1e] ${enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span
                            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${enabled ? 'translate-x-[24px]' : 'translate-x-0'}`}
                        />
                    </button>
                </div>

                {/* Dropdowns Container */}
                <div className="space-y-4">
                    {/* Target Language */}
                    <div className="relative group">
                        <div className="absolute -top-2.5 left-3 px-1.5 bg-[#1a1b1e] text-[10px] font-bold text-gray-400 uppercase tracking-wider z-10">
                            Main Subtitle Language
                        </div>
                        <div className="relative">
                            <select
                                value={targetLang}
                                onChange={(e) => saveSettings({ targetLang: e.target.value })}
                                className="w-full bg-transparent text-gray-200 border border-gray-600 rounded-xl p-3.5 pl-4 pr-10 text-[15px] appearance-none focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all cursor-pointer hover:border-gray-500"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code} className="bg-[#1a1b1e]">
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Hover Language */}
                    <div className="relative group">
                        <div className="absolute -top-2.5 left-3 px-1.5 bg-[#1a1b1e] text-[10px] font-bold text-gray-400 uppercase tracking-wider z-10">
                            Hover Tooltip Language
                        </div>
                        <div className="relative">
                            <select
                                value={hoverTargetLang}
                                onChange={(e) => saveSettings({ hoverTargetLang: e.target.value })}
                                className="w-full bg-transparent text-gray-200 border border-gray-600 rounded-xl p-3.5 pl-4 pr-10 text-[15px] appearance-none focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all cursor-pointer hover:border-gray-500"
                            >
                                <option value="auto" className="bg-[#1a1b1e]">✨ Smart (Auto-Flip)</option>
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code} className="bg-[#1a1b1e]">
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Size Slider */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-[15px] font-medium text-white min-w-[30px]">Size</span>
                        <input
                            type="range"
                            min="16"
                            max="48"
                            step="2"
                            value={fontSize}
                            onChange={(e) => saveSettings({ fontSize: Number(e.target.value) })}
                            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500"
                        />
                        <span className="text-[15px] text-gray-400 font-mono w-[40px] text-right">{fontSize}px</span>
                    </div>
                </div>

                {/* Color Picker */}
                <div className="flex justify-between items-center pt-1">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => saveSettings({ color: c })}
                            className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${color === c ? 'transform scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1a1b1e]' : 'hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-600 hover:ring-gray-400 transition-all ml-1">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => saveSettings({ color: e.target.value })}
                            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500" /> {/* Placeholder visual for custom */}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-2">
                    <p className="text-[11px] text-gray-500">
                        Pro tip: Drag the subtitle box to move it.
                    </p>
                </div>

            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
}
