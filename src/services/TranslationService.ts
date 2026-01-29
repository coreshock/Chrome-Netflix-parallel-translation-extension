export const translateText = async (text: string, sourceLang: string = 'auto', targetLang: string = 'en'): Promise<string> => {
    if (!text) return '';

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'translate',
            payload: { text, sourceLang, targetLang }
        }, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else if (response && response.success) {
                resolve(response.data);
            } else {
                reject(response?.error || 'Unknown translation error');
            }
        });
    });
};
