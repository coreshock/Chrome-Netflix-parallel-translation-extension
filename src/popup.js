const defaultSettings = {
  enabled: false,
  sourceLang: 'de',
  targetLang: 'en',
  fontSize: 40,
  verticalPosition: 60,
  fontColor: '#ffff00'
};

document.addEventListener('DOMContentLoaded', function() {
  const enableTranslation = document.getElementById('enableTranslation');
  const sourceLang = document.getElementById('sourceLang');
  const targetLang = document.getElementById('targetLang');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSize = document.getElementById('fontSize');
  const verticalPositionSlider = document.getElementById('verticalPositionSlider');
  const verticalPosition = document.getElementById('verticalPosition');
  const fontColor = document.getElementById('fontColor');
  const resetDefaults = document.getElementById('resetDefaults');

  // Load saved settings
  chrome.storage.sync.get(defaultSettings, function(items) {
    enableTranslation.checked = items.enabled;
    sourceLang.value = items.sourceLang;
    targetLang.value = items.targetLang;
    fontSize.value = items.fontSize;
    fontSizeSlider.value = items.fontSize;
    verticalPosition.value = items.verticalPosition;
    verticalPositionSlider.value = items.verticalPosition;
    fontColor.value = items.fontColor;
  });

  // Event listeners for immediate setting changes
  enableTranslation.addEventListener('change', saveSettings);
  sourceLang.addEventListener('change', saveSettings);
  targetLang.addEventListener('change', saveSettings);
  fontSizeSlider.addEventListener('input', () => {
    fontSize.value = fontSizeSlider.value;
    saveSettings();
  });
  fontSize.addEventListener('input', () => {
    fontSizeSlider.value = fontSize.value;
    saveSettings();
  });
  verticalPositionSlider.addEventListener('input', () => {
    verticalPosition.value = verticalPositionSlider.value;
    saveSettings();
  });
  verticalPosition.addEventListener('input', () => {
    verticalPositionSlider.value = verticalPosition.value;
    saveSettings();
  });
  fontColor.addEventListener('change', saveSettings);

  // Reset to defaults
  resetDefaults.addEventListener('click', function() {
    Object.assign(document.forms[0].elements, defaultSettings);
    saveSettings();
  });

  function saveSettings() {
    const settings = {
      enabled: enableTranslation.checked,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      fontSize: parseInt(fontSize.value),
      verticalPosition: parseInt(verticalPosition.value),
      fontColor: fontColor.value
    };

    chrome.storage.sync.set(settings, function() {
      // Notify content script of settings change
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "updateSettings", settings: settings});
      });
    });
  }
});