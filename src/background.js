chrome.runtime.onInstalled.addListener(function() {
  console.log('Subtitle Translator extension installed');
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && (tab.url.includes('netflix.com') || tab.url.includes('youtube.com'))) {
    console.log('Matching tab updated:', tab.url);
    chrome.tabs.sendMessage(tabId, {action: 'initializeTranslation'});
  }
});