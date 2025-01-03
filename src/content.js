let lastSubtitle = '';
let translationDiv = null;
let debugDiv = null;

function debugLog(message) {
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.className = 'debug-container';
        document.body.appendChild(debugDiv);
    }
    const time = new Date().toLocaleTimeString();
    debugDiv.innerHTML += `${time}: ${message}<br>`;
    debugDiv.scrollTop = debugDiv.scrollHeight;
    console.log(`Debug: ${message}`);
}

function createTranslationContainer() {
    debugLog('Creating translation container');
    translationDiv = document.createElement('div');
    translationDiv.className = 'translation-container';
    const textDiv = document.createElement('div');
    textDiv.className = 'translation-text';
    translationDiv.appendChild(textDiv);
    document.body.appendChild(translationDiv);
    debugLog('Translation container created');
}

function updateTranslation(translation) {
    debugLog(`Updating translation: ${translation}`);
    const textDiv = translationDiv.querySelector('.translation-text');
    textDiv.textContent = translation;
}

function checkForSubtitles() {
    const subtitleElement = document.querySelector('.player-timedtext-text-container');
    debugLog(`Subtitle element found: ${!!subtitleElement}`);
    
    if (subtitleElement) {
        const currentSubtitle = subtitleElement.textContent.trim();
        debugLog(`Current subtitle: ${currentSubtitle}`);
        
        if (currentSubtitle && currentSubtitle !== lastSubtitle) {
            lastSubtitle = currentSubtitle;
            debugLog('Sending subtitle for translation');
            chrome.runtime.sendMessage({text: currentSubtitle});
        }
    }
}

debugLog('Extension initialized');
createTranslationContainer();
const checkInterval = setInterval(checkForSubtitles, 1000);
debugLog('Subtitle check interval started');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.translation) {
        debugLog(`Received translation: ${message.translation}`);
        updateTranslation(message.translation);
    }
});
