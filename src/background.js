async function scrapeTranslation(text, tabId) {
  console.log(`Translating: ${text}`);
  const url = `https://translate.google.com/?sl=de&tl=en&text=${encodeURIComponent(text)}`;
  
  try {
    const translationTab = await chrome.tabs.create({ url, active: false });
    console.log('Translation tab created:', translationTab.id);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: translationTab.id },
      func: () => {
        console.log('Executing script in translation tab');
        return document.querySelector('.ryNqvb')?.textContent || 
               document.querySelector('[jsname="W297wb"]')?.textContent || 
               'Translation not found';
      }
    });
    
    console.log('Translation result:', result.result);
    await chrome.tabs.remove(translationTab.id);
    
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { translation: result.result });
    }
    return result.result;
  } catch (error) {
    console.error('Translation error:', error);
    return 'Error: ' + error.message;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text) {
    const tabId = message.tabId || sender.tab?.id;
    scrapeTranslation(message.text, tabId).then(translation => {
      if (message.action === 'testTranslation') {
        chrome.runtime.sendMessage({
          status: `Test result: ${translation}`
        });
      }
    });
  }
  return true;
});