console.log('Subtitle Translator content script loaded');

import { detectSubtitles, extractArdSubtitles } from './subtitle-detection.js';
import { translateText } from './translate.js';
import { createTranslatedSubtitleElement, clearTranslatedSubtitle, updateSubtitleStyles, sanitizeSubtitleText, debounce } from './ui-manipulation.js';

let settings = {
  enabled: false,
  sourceLang: 'de',
  targetLang: 'en',
  fontSize: 40,
  verticalPosition: 60,
  fontColor: '#ffff00'
};

let originalSubtitleElement = null;
let translatedSubtitleElement = null;
let lastSanitizedText = '';
let ardSubtitleElement = null;
let lastTranslatedArdSubtitles = [];

const debouncedTranslateSubtitles = debounce(async () => {
  console.log('debouncedTranslateSubtitles called');
  if (!settings.enabled) {
    console.log('Translation not performed. Enabled:', settings.enabled);
    clearTranslatedSubtitle(translatedSubtitleElement);
    return;
  }

  if (originalSubtitleElement) {
    console.log('Original subtitle element found');
    const originalText = originalSubtitleElement.textContent.trim();
    const sanitizedText = sanitizeSubtitleText(originalText);
    console.log('Original text:', originalText, 'Sanitized text:', sanitizedText);

    if (sanitizedText === '') {
      console.log('Sanitized text is empty, clearing translated subtitle');
      clearTranslatedSubtitle(translatedSubtitleElement);
      lastSanitizedText = '';
      return;
    }

    if (sanitizedText === lastSanitizedText) {
      console.log('No new subtitle detected, skipping translation.');
      return;
    }

    lastSanitizedText = sanitizedText;

    try {
      console.log('Attempting translation:', sanitizedText);
      const translatedText = await translateText(sanitizedText, settings.sourceLang, settings.targetLang);
      console.log('Translated subtitle:', translatedText);
      if (translatedSubtitleElement) {
        translatedSubtitleElement.textContent = translatedText;
      }
    } catch (error) {
      console.error('Translation failed:', error);
      clearTranslatedSubtitle(translatedSubtitleElement);
    }
  }

  if (ardSubtitleElement) {
    console.log('ARD subtitle element found');
    const ardSubtitles = extractArdSubtitles(ardSubtitleElement);
    console.log('Extracted ARD subtitles:', ardSubtitles);
    const newSubtitles = ardSubtitles.filter(subtitle => !lastTranslatedArdSubtitles.some(lastSubtitle => lastSubtitle.text === subtitle.text));
    console.log('New ARD subtitles:', newSubtitles);

    if (newSubtitles.length > 0) {
      try {
        console.log('Attempting ARD subtitle translation:', newSubtitles);
        const translatedSubtitles = await Promise.all(newSubtitles.map(subtitle => translateText(subtitle.text, settings.sourceLang, settings.targetLang)));
        console.log('Translated ARD subtitles:', translatedSubtitles);

        newSubtitles.forEach((subtitle, index) => {
          subtitle.translatedText = translatedSubtitles[index];
        });

        ardSubtitles.forEach(subtitle => {
          if (!subtitle.translatedText) {
            const newSubtitle = newSubtitles.find(newSub => newSub.text === subtitle.text);
            subtitle.translatedText = newSubtitle ? newSubtitle.translatedText : '';
          }
        });

        displayArdSubtitles(ardSubtitles);
        lastTranslatedArdSubtitles = ardSubtitles;
      } catch (error) {
        console.error('ARD subtitle translation failed:', error);
      }
    }
  }
}, 300);

function initializeTranslation() {
  console.log('Initializing translation');
  originalSubtitleElement = detectSubtitles();
  console.log('Detected original subtitle element:', originalSubtitleElement);
  ardSubtitleElement = window.location.hostname.includes('ardmediathek.de') ? detectSubtitles() : null;
  console.log('Detected ARD subtitle element:', ardSubtitleElement);

  if (originalSubtitleElement && !ardSubtitleElement) {
    console.log('Initializing Netflix translation');
    translatedSubtitleElement = createTranslatedSubtitleElement();
    updateSubtitleStyles(translatedSubtitleElement, settings);

    const observer = new MutationObserver(() => {
      debouncedTranslateSubtitles();
    });
    observer.observe(originalSubtitleElement, { childList: true, subtree: true, characterData: true });
    console.log('MutationObserver set up for:', originalSubtitleElement);

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    console.log('Full-screen change event listener added');
  } else if (ardSubtitleElement) {
    initializeArdTranslation();
  } else {
    console.log('Subtitles not found. Retrying in 1 second...');
    setTimeout(initializeTranslation, 1000);
  }
}

function initializeArdTranslation() {
  console.log('Initializing ARD translation');
  ardSubtitleElement = detectSubtitles();
  console.log('Detected ARD subtitle element:', ardSubtitleElement);

  if (ardSubtitleElement) {
    const observer = new MutationObserver(() => {
      debouncedTranslateSubtitles();
    });
    observer.observe(ardSubtitleElement, { childList: true, subtree: true, characterData: true });
    console.log('MutationObserver set up for ARD subtitles:', ardSubtitleElement);
  } else {
    console.log('ARD subtitles not found. Retrying in 1 second...');
    setTimeout(initializeArdTranslation, 1000);
  }
}

function displayArdSubtitles(subtitles) {
  console.log('Displaying ARD subtitles:', subtitles);
  const container = ardSubtitleElement.parentElement;
  let displayContainer = document.getElementById('ard-subtitles-display');

  if (!displayContainer) {
    displayContainer = document.createElement('div');
    displayContainer.id = 'ard-subtitles-display';
    displayContainer.style.position = 'absolute';
    displayContainer.style.bottom = '10%';
    displayContainer.style.left = '50%';
    displayContainer.style.transform = 'translateX(-50%)';
    displayContainer.style.textAlign = 'center';
    displayContainer.style.zIndex = '1000';
    container.appendChild(displayContainer);
  }

  displayContainer.innerHTML = '';
  subtitles.forEach(subtitle => {
    const subtitleElement = document.createElement('p');
    subtitleElement.textContent = subtitle.translatedText || subtitle.text;
    subtitleElement.style.color = settings.fontColor;
    subtitleElement.style.fontSize = `${settings.fontSize}px`;
    subtitleElement.style.margin = '5px';
    displayContainer.appendChild(subtitleElement);
  });
}

function handleFullScreenChange() {
  console.log('Full-screen state changed');
  const fsElement = document.fullscreenElement;

  if (fsElement) {
    console.log('Entered full-screen mode');
    if (translatedSubtitleElement) {
      fsElement.appendChild(translatedSubtitleElement);
    }
    if (ardSubtitleElement) {
      const displayContainer = document.getElementById('ard-subtitles-display');
      if (displayContainer) {
        fsElement.appendChild(displayContainer);
      }
    }
  } else {
    console.log('Exited full-screen mode');
    if (translatedSubtitleElement) {
      document.body.appendChild(translatedSubtitleElement);
    }
    if (ardSubtitleElement) {
      const displayContainer = document.getElementById('ard-subtitles-display');
      if (displayContainer) {
        ardSubtitleElement.parentElement.appendChild(displayContainer);
      }
    }
  }

  if (translatedSubtitleElement) {
    updateSubtitleStyles(translatedSubtitleElement, settings);
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateSettings") {
    settings = request.settings;
    console.log('Settings updated:', settings);
    if (translatedSubtitleElement) {
      updateSubtitleStyles(translatedSubtitleElement, settings);
    }
    if (!settings.enabled) {
      clearTranslatedSubtitle(translatedSubtitleElement);
      const ardDisplayContainer = document.getElementById('ard-subtitles-display');
      if (ardDisplayContainer) {
        ardDisplayContainer.remove();
      }
    } else {
      debouncedTranslateSubtitles();
    }
  }
});

console.log('Attempting initial translation setup');
initializeTranslation();

setInterval(() => {
  if (!originalSubtitleElement && !ardSubtitleElement) {
    console.log('Periodic check: Attempting to detect subtitles');
    initializeTranslation();
  }
}, 5000);