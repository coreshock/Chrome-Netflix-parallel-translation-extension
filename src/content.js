console.log('Subtitle Translator content script loaded');

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

const debouncedTranslateSubtitles = debounce(async () => {
  if (!settings.enabled || !originalSubtitleElement) {
    console.log('Translation not performed. Enabled:', settings.enabled, 'Original subtitle element:', originalSubtitleElement);
    clearTranslatedSubtitle(translatedSubtitleElement);
    return;
  }

  const originalText = originalSubtitleElement.textContent.trim();
  const sanitizedText = sanitizeSubtitleText(originalText);

  if (sanitizedText === '') {
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
    const translatedText = await translateText(sanitizedText, settings.sourceLang, settings.targetLang);
    console.log('Translated subtitle:', translatedText);
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = translatedText;
    }
  } catch (error) {
    console.error('Translation failed:', error);
    clearTranslatedSubtitle(translatedSubtitleElement);
  }
}, 300);

function initializeTranslation() {
  console.log('Initializing translation');
  originalSubtitleElement = detectSubtitles();
  if (originalSubtitleElement) {
    translatedSubtitleElement = createTranslatedSubtitleElement();
    updateSubtitleStyles(translatedSubtitleElement, settings);

    const observer = new MutationObserver(() => {
      debouncedTranslateSubtitles();
    });
    observer.observe(originalSubtitleElement, { childList: true, subtree: true, characterData: true });
    console.log('MutationObserver set up for:', originalSubtitleElement);

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    console.log('Full-screen change event listener added');
  } else {
    console.log('Subtitles not found. Retrying in 1 second...');
    setTimeout(initializeTranslation, 1000);
  }
}

function handleFullScreenChange() {
  console.log('Full-screen state changed');
  if (document.fullscreenElement) {
    console.log('Entered full-screen mode');
    document.fullscreenElement.appendChild(translatedSubtitleElement);
  } else {
    console.log('Exited full-screen mode');
    document.body.appendChild(translatedSubtitleElement);
  }
  updateSubtitleStyles(translatedSubtitleElement, settings);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateSettings") {
    settings = request.settings;
    console.log('Settings updated:', settings);
    updateSubtitleStyles(translatedSubtitleElement, settings);
    if (!settings.enabled) {
      clearTranslatedSubtitle(translatedSubtitleElement);
    } else {
      debouncedTranslateSubtitles();
    }
  }
});

console.log('Attempting initial translation setup');
initializeTranslation();

setInterval(() => {
  if (!originalSubtitleElement) {
    console.log('Periodic check: Attempting to detect subtitles');
    initializeTranslation();
  }
}, 5000);