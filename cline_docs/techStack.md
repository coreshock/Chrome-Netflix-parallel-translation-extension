## Core Technologies
- **JavaScript:** Primary language for extension logic and functionality.
- **HTML:** Used for creating the extension's popup UI.
- **CSS:** Used for styling the extension's UI and subtitles.

## Libraries and Frameworks
- **No external libraries or frameworks are used at this time.**

## Architecture
- **Content Script:** `src/content.js` handles the main logic for interacting with the Netflix page and other future services and injecting translated subtitles.
- **Background Script:** `src/background.js` manages background tasks and communication with the content script.
- **Popup Script:** `src/popup.js` handles the extension's popup UI logic.
- **Subtitle Detection:** `src/subtitle-detection.js` responsible for detecting subtitles on the Netflix page and other future services.
- **Translation:** `src/translate.js` will handle the translation of subtitles.
- **UI Manipulation:** `src/ui-manipulation.js` will handle the manipulation of the Netflix and other future services UI to display translated subtitles.
- **Utilities:** `src/utils.js` will contain utility functions used throughout the extension.