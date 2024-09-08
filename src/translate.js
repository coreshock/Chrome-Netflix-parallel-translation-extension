async function translateText(text, sourceLang, targetLang) {
  const apiUrl = 'http://localhost:5000/translate';  // LibreTranslate server URL

  try {
    console.log('Sending translation request...');
    
    // Make a POST request to LibreTranslate server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,           // The text to be translated
        source: sourceLang, // Source language code
        target: targetLang, // Target language code
        format: 'text'      // Format of the text
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Translation response:', data);
    
    // Check if translation exists and return it
    if (data.translatedText) {
      return data.translatedText;
    } else {
      throw new Error('No valid translation found');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}
