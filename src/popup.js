document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const sourceLangSelect = document.getElementById('sourceLang');
  const targetLangSelect = document.getElementById('targetLang');
  const fontSizeInput = document.getElementById('fontSize');
  const verticalPositionInput = document.getElementById('verticalPosition');
  const saveButton = document.getElementById('save');

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'sourceLang', 'targetLang', 'fontSize', 'verticalPosition'], function(result) {
    enabledCheckbox.checked = result.enabled || false;
    sourceLangSelect.value = result.sourceLang || 'de';
    targetLangSelect.value = result.targetLang || 'en';
    fontSizeInput.value = result.fontSize || 40;
    verticalPositionInput.value = result.verticalPosition || 60;
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    const settings = {
      enabled: enabledCheckbox.checked,
      sourceLang: sourceLangSelect.value,
      targetLang: targetLangSelect.value,
      fontSize: parseInt(fontSizeInput.value),
      verticalPosition: parseInt(verticalPositionInput.value)
    };

    chrome.storage.sync.set(settings, function() {
      console.log('Settings saved:', settings);
      // Notify content script about updated settings
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSettings', settings: settings});
      });
    });
  });
});