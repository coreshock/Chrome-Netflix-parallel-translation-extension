// translate.js
const translateText = async (text, sourceLang, targetLang) => {
  console.log('translateText called with text:', text, 'sourceLang:', sourceLang, 'targetLang:', targetLang);
  try {
    console.log('Sending translation request...');
    
    // Use Google's free translation API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Translation API response:', data);
    
    // Extract the translated text from Google's response
    const translatedText = data.sentences
      .map(sentence => sentence.trans)
      .join("");
    console.log('Translated text:', translatedText);
    
    return translatedText;
    
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

export { translateText };