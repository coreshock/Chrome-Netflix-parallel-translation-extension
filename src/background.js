chrome.runtime.onInstalled.addListener(function() {
  console.log('Subtitle Translator extension installed');
  chrome.storage.sync.set({
    enabled: false,
    sourceLang: 'en',
    targetLang: 'en',
    fontSize: 40,
    verticalPosition: 60
  }, function() {
    console.log('Default settings saved');
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.includes('netflix.com')) {
    console.log('Netflix tab updated:', tab.url);
    chrome.tabs.sendMessage(tabId, {action: 'initializeTranslation'});
  }
});