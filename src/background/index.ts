console.log('Background service worker started (v1.0)');

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.action === 'translate') {
        const { text, sourceLang, targetLang } = request.payload;
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(text)}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const translatedText = data.sentences
                    .map((sentence: any) => sentence.trans)
                    .join("");
                sendResponse({ success: true, data: translatedText });
            })
            .catch(error => {
                console.error('Translation error:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep channel open for async response
    }
});
