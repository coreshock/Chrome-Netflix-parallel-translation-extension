document.getElementById('testTranslation').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
    chrome.runtime.sendMessage({
      action: 'testTranslation',
      text: 'Guten Morgen',
      tabId: tab.id
    });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.status) {
    document.getElementById('status').textContent = message.status;
  }
});