// translate.js
async function translateText(text, sourceLang, targetLang) {
  try {
    console.log('Sending translation request...');
    
    // Use Google's free translation API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the translated text from Google's response
    const translatedText = data.sentences
      .map(sentence => sentence.trans)
      .join("");
    
    return translatedText;
    
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}