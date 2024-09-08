document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const sourceLangSelect = document.getElementById('sourceLang');
  const targetLangSelect = document.getElementById('targetLang');
  const fontSizeInput = document.getElementById('fontSize');
  const verticalPositionInput = document.getElementById('verticalPosition');
  const saveButton = document.getElementById('save');
  const checkServerButton = document.getElementById('checkServer');
  const launchServerButton = document.getElementById('launchServer');
  const stopServerButton = document.getElementById('stopServer');
  const serverStatusElement = document.getElementById('serverStatus');

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'sourceLang', 'targetLang', 'fontSize', 'verticalPosition'], function(result) {
    enabledCheckbox.checked = result.enabled || false;
    sourceLangSelect.value = result.sourceLang || 'en';
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
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSettings', settings: settings});
      });
    });
  });

  // Check server status
  checkServerButton.addEventListener('click', function() {
    fetch('http://localhost:5000/languages')
      .then(response => response.json())
      .then(data => {
        serverStatusElement.textContent = 'Server is running';
        serverStatusElement.style.color = 'green';
      })
      .catch(error => {
        serverStatusElement.textContent = 'Server is not running';
        serverStatusElement.style.color = 'red';
      });
  });

  // Launch server
  launchServerButton.addEventListener('click', function() {
    chrome.runtime.sendNativeMessage('com.example.libretranslate_server',
      { action: 'launch' },
      function(response) {
        if (response && response.success) {
          serverStatusElement.textContent = 'Server launched successfully';
          serverStatusElement.style.color = 'green';
        } else {
          serverStatusElement.textContent = 'Failed to launch server';
          serverStatusElement.style.color = 'red';
        }
      }
    );
  });

  // Stop server
  stopServerButton.addEventListener('click', function() {
    chrome.runtime.sendNativeMessage('com.example.libretranslate_server',
      { action: 'stop' },
      function(response) {
        if (response && response.success) {
          serverStatusElement.textContent = 'Server stopped successfully';
          serverStatusElement.style.color = 'green';
        } else {
          serverStatusElement.textContent = 'Failed to stop server';
          serverStatusElement.style.color = 'red';
        }
      }
    );
  });
});