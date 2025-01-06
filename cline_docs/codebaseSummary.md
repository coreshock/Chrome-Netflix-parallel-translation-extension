## Key Components and Their Interactions
- **Content Script (`src/content.js`):** Injects into the Netflix and other future services pages, detects subtitles, sends them to the background script for translation, and displays the translated subtitles.
- **Background Script (`src/background.js`):** Handles communication between the content script and the translation API.
- **Popup Script (`src/popup.js`):** Manages the extension's popup UI, allowing users to configure settings.
- **Subtitle Detection (`src/subtitle-detection.js`):** Detects subtitles on the Netflix and other future services page.
- **Translation (`src/translate.js`):** Translates subtitles using a translation API.
- **UI Manipulation (`src/ui-manipulation.js`):** Manipulates the Netflix UI and other future services to display translated subtitles.
- **Utilities (`src/utils.js`):** Provides utility functions used throughout the extension.

## Data Flow
1. The content script detects subtitles on the Netflix and other future services pages.
2. The content script sends the subtitles to the background script.
3. The background script sends the subtitles to the translation API.
4. The background script receives the translated subtitles from the API.
5. The background script sends the translated subtitles back to the content script.
6. The content script displays the translated subtitles on the Netflix and other future services pages.

## External Dependencies
- **No external libraries or APIs are used at this time.**

## Recent Significant Changes
 - Initial project setup and file creation.
 - Implemented subtitle detection, translation and display functionality on Netflix
 - Created `code_examples` directory with subdirectories for each service (Netflix, ARD, YouTube, ZDF) and a general subdirectory for code examples.
 - Code examples in the `code_examples` directory should use a `_code` suffix in their filenames (e.g., `example_code.js`, `example_code.html`) to distinguish them from the main project's source files.

## User Feedback Integration and Its Impact on Development
- The developer is happy with current implementation for Netflix and would like to extend supported services to ARD, Youtube and ZDF.
- UI updates are necessary to allow users to configure settings for supported services, such as per-service subtitle font/outline size and color, position of the subtitles, and translation language settings.
- Subtitle positioning setup should be remade from slider to a simple on-screen dragging of the subtitles to desired position.
