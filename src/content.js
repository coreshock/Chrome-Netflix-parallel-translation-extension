console.log('Subtitle Translator content script loaded');

let settings = {
  enabled: false,
  sourceLang: 'de',
  targetLang: 'en',
  fontSize: 40,
  verticalPosition: 60
};

let originalSubtitleElement = null;
let translatedSubtitleElement = null;
let lastOriginalText = ''; // Store the last original subtitle text

function createTranslatedSubtitleElement() {
  if (!translatedSubtitleElement) {
    translatedSubtitleElement = document.createElement('div');
    translatedSubtitleElement.id = 'translated-subtitle';
    translatedSubtitleElement.style.position = 'absolute';
    translatedSubtitleElement.style.width = '100%';
    translatedSubtitleElement.style.textAlign = 'center';
    translatedSubtitleElement.style.color = 'yellow';
    document.body.appendChild(translatedSubtitleElement);
    console.log('Translated subtitle element created');
  }
}

function updateSubtitleStyles() {
  if (originalSubtitleElement) {
    originalSubtitleElement.style.fontSize = `${settings.fontSize}px`;
    console.log('Updated original subtitle font size:', settings.fontSize);
  }
  if (translatedSubtitleElement) {
    translatedSubtitleElement.style.fontSize = `${settings.fontSize}px`;
    translatedSubtitleElement.style.bottom = `${settings.verticalPosition}px`;
    console.log('Updated translated subtitle styles:', { fontSize: settings.fontSize, bottom: settings.verticalPosition });
  }
}

function detectSubtitles() {
  console.log('Detecting subtitles...');

  // Netflix subtitle detection
  const netflixSubtitles = document.querySelector('.player-timedtext');
  if (netflixSubtitles) {
    console.log('Netflix subtitles detected:', netflixSubtitles);
    originalSubtitleElement = netflixSubtitles;
    return true;
  }

  // Additional Netflix subtitle detection methods
  const alternateNetflixSubtitles = document.querySelector('.player-timedtext-text-container');
  if (alternateNetflixSubtitles) {
    console.log('Alternate Netflix subtitles detected:', alternateNetflixSubtitles);
    originalSubtitleElement = alternateNetflixSubtitles;
    return true;
  }

  console.log('No subtitles detected.');
  return false;
}

// Helper function to sanitize subtitle text
function sanitizeSubtitleText(text) {
  // Add line breaks after ".", "!", "?" or "..." if there's none already
  text = text.replace(/([.!?]+)(?=[^\n])/g, '$1\n');  // Ensures a line break after punctuation unless a new line already follows

  // Add line breaks before common new line beginnings like "-" or "*" if there's none already
  text = text.replace(/([^\n])([-*])/g, '$1\n$2');    // Ensures a line break before "-" or "*"

  // Preserve ellipsis "..." cases with no space after them
  text = text.replace(/(\.\.\.)([^\s-])/g, '$1 $2');  // Add space after "..." unless followed by space or hyphen

  // Remove extra spaces around the text and reduce multiple spaces in between
  text = text.trim().replace(/\s\s+/g, ' ');

  return text;
}

let lastSanitizedText = ''; // Store the last sanitized subtitle text

async function translateSubtitles() {
  if (!settings.enabled || !originalSubtitleElement) {
    console.log('Translation not performed. Enabled:', settings.enabled, 'Original subtitle element:', originalSubtitleElement);
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = ''; // Clear translated subtitle when disabled
    }
    return;
  }

  const originalText = originalSubtitleElement.textContent.trim();
  console.log('Original subtitle before sanitization:', originalText);

  const sanitizedText = sanitizeSubtitleText(originalText);
  console.log('Original subtitle after sanitization:', sanitizedText);

  // If the original subtitle is empty or has been cleared, clear the translated subtitle
  if (sanitizedText === '') {
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = ''; // Clear the translated subtitle if original is empty
    }
    lastSanitizedText = ''; // Reset last sanitized text
    return;
  }

  // Check if the sanitized subtitle is the same as the last one
  if (sanitizedText === lastSanitizedText) {
    console.log('No new subtitle detected, skipping translation.');
    return;
  }

  // Update last sanitized subtitle text
  lastSanitizedText = sanitizedText;

  try {
    const translatedText = await translateText(sanitizedText, settings.sourceLang, settings.targetLang);
    console.log('Translated subtitle:', translatedText);
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = translatedText;
    }
  } catch (error) {
    console.error('Translation failed:', error);
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = ''; // Clear the subtitle instead of showing an error message
    }
  }
}

function clearTranslatedSubtitle() {
  if (translatedSubtitleElement) {
    translatedSubtitleElement.textContent = ''; // Clear the translated subtitle
  }
}

function initializeTranslation() {
  console.log('Initializing translation');
  if (detectSubtitles()) {
    createTranslatedSubtitleElement();
    updateSubtitleStyles();

    // Set up a MutationObserver to detect subtitle changes
    const observer = new MutationObserver((mutations) => {
      console.log('Subtitle mutation detected:', mutations);
      translateSubtitles();
    });
    observer.observe(originalSubtitleElement, { childList: true, subtree: true, characterData: true });
    console.log('MutationObserver set up for:', originalSubtitleElement);
  } else {
    console.log('Subtitles not found. Retrying in 1 second...');
    setTimeout(initializeTranslation, 1000);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'initializeTranslation') {
    console.log('Received initializeTranslation message');
    initializeTranslation();
  } else if (request.action === 'updateSettings') {
    settings = request.settings;
    console.log('Settings updated:', settings);
    updateSubtitleStyles();
    if (!settings.enabled) {
      clearTranslatedSubtitle(); // Immediately clear the translated subtitle when translation is disabled
    }
  }
});

// Attempt to initialize on content script load
console.log('Attempting initial translation setup');
initializeTranslation();

// Add a periodic check for subtitles
setInterval(() => {
  if (!originalSubtitleElement) {
    console.log('Periodic check: Attempting to detect subtitles');
    initializeTranslation();
  }
}, 5000);
