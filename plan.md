# Migration Plan: Legacy MV2 to Modern MV3 (React + Vite)

## 1. Project Scaffolding & Build Configuration
- **Goal:** Initialize a modern build environment utilizing Vite, React, TypeScript, and CRXJS.
- **Details:**
  - Initialize a new Vite project (`npm create vite@latest`).
  - Install `@crxjs/vite-plugin` for seamless Chrome Extension development with HMR.
  - Configure `vite.config.ts` to handle content scripts, background service workers, and popups.
  - Set up directory structure to separate `src` (modern) from `legacy` references until porting is complete.

## 2. Manifest V3 & Base Configuration
- **Goal:** Create a valid `manifest.json` complying with V3 standards.
- **Details:**
  - Define `manifest_version: 3`.
  - Convert `background` scripts to `service_worker`.
  - Update permissions (remove broad host permissions if possible, use `scripting` API).
  - Define `web_accessible_resources` for assets needed in the Shadow DOM (css, icons).

## 3. Core Logic Migration (Service Worker & Subtitle Detection)
- **Goal:** Port the extraction and translation logic to TypeScript, fixing memory leaks and injection issues.
- **Details:**
  - **Service Worker:** Port `background.js` listeners to the Service Worker architecture (ephemeral state).
  - **Detection Logic:** Refactor `subtitle-detection.js` into a robust `SubtitleObserver` class using `MutationObserver` or `Interval` polling, robust against class name changes (e.g., using attribute selectors or relative positioning).
  - **Injection:** Replace direct DOM manipulation with a Shadow DOM host injection to prevent style bleeding.

## 4. UI/UX Overhaul (React + Tailwind + Shadow DOM)
- **Goal:** Replace vanilla JS HTML injection with a React application rendered inside Shadow DOM.
- **Details:**
  - **Content Script UI:** Create a React root inside the Shadow DOM for the subtitle overlay.
  - **Styles:** Use TailwindCSS, ensuring styles are injected *inside* the Shadow DOM (`:host` scoping).
  - **Popup:** Rebuild the settings popup with React for better state management (language selection, toggle on/off).
  - **Features:** Implement "Instant Translation" on hover and "Dual Subtitles" view.

## 5. Testing, Verification & Cleanup
- **Goal:** Ensure stability across Netflix/YouTube and remove legacy code.
- **Details:**
  - **E2E Testing:** Verify injection works on Netflix and YouTube player loads.
  - **State Persistence:** Ensure settings save/load correctly via `chrome.storage`.
  - **Cleanup:** Remove all legacy JS files (`utils.js`, `ui-manipulation.js`, old `manifest.json`).
  - **Prod Build:** Run `npm run build` and test the production artifact in Chrome.
