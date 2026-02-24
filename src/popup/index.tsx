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
        <div className="w-80 min-h-[350px] bg-slate-900 text-slate-100 font-sans overflow-hidden selection:bg-red-500 selection:text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-3 shadow-lg flex items-center justify-between">
                <h1 className="text-base font-bold tracking-wide flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                    Netflix Translator
                </h1>
                <div className="text-[10px] opacity-75 font-mono">v{chrome?.runtime?.getManifest?.()?.version || '1.3.2'}</div>
            </div>

            <div className="p-4 space-y-4">

                {/* Enable Switch */}
                <div className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="font-medium text-slate-300 text-sm">Enable Translation</span>
                    <button
                        onClick={() => saveSettings({ enabled: !enabled })}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-green-500' : 'bg-slate-600'}`}
                    >
                        {/* Centered Circle: top-1/2 -translate-y-1/2 ensures perfect vertical centering */}
                        <div className={`absolute top-1/2 -translate-y-1/2 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className={`space-y-4 transition-opacity duration-200 ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                    {/* Target Language */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Main Subtitle Language</label>
                        <div className="relative">
                            <select
                                value={targetLang}
                                onChange={(e) => saveSettings({ targetLang: e.target.value })}
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg p-2 pl-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all hover:bg-slate-750"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Hover Language */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hover Tooltip Language</label>
                        <div className="relative">
                            <select
                                value={hoverTargetLang}
                                onChange={(e) => saveSettings({ hoverTargetLang: e.target.value })}
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg p-2 pl-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all hover:bg-slate-750"
                            >
                                <option value="auto">✨ Smart (Auto-Flip)</option>
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-3 pt-1 border-t border-slate-800/50">
                        {/* Font Size */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Size</span>
                                <span className="text-slate-200">{fontSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="16"
                                max="48"
                                step="2"
                                value={fontSize}
                                onChange={(e) => saveSettings({ fontSize: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
                            />
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Color</span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => saveSettings({ color: c })}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-slate-600 hover:border-slate-400 transition-colors">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => saveSettings({ color: e.target.value })}
                                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer / Status */}
            <div className="bg-slate-950 p-2 text-center text-[10px] text-slate-600 border-t border-slate-800">
                {status || 'Pro tip: Drag the subtitle box to move it.'}
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
}
