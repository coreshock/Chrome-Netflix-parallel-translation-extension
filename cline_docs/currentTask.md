## Current Objective
Continue building the Chrome extension for real-time Netflix subtitle translation. The Netflix part is fully implemented, now I want to add ARD subtitle detection and translation.

## Context
The project is currently at the middle stage. The goal is to implement the extended functionality of the extension, including ubtitle detection and real-time translation in other services like ARD, Youtube and ZDF. This task is related to the "Support additional video services, such as ARD" goal in `projectRoadmap.md`.

## Next Steps
- [ ] Implement ARD subtitle detection and extraction logic in `src/subtitle-detection.js` using my working and tested example from \code_examples\ard\detection_example_code.js and \code_examples\ard\extraction_example_code.js 
- [ ] Update translation function in `src/translate.js` to handle ARD subtitles.
- [ ] Integrate ARD subtitles detection, translation and ARD page injection in `src/content.js`