function createTranslatedSubtitleElement() {
    const translatedSubtitleElement = document.createElement('div');
    translatedSubtitleElement.id = 'translated-subtitle';
    translatedSubtitleElement.style.position = 'fixed';
    translatedSubtitleElement.style.left = '0';
    translatedSubtitleElement.style.right = '0';
    translatedSubtitleElement.style.textAlign = 'center';
    translatedSubtitleElement.style.color = 'yellow';
    translatedSubtitleElement.style.zIndex = '9999999';
    document.body.appendChild(translatedSubtitleElement);
    console.log('Translated subtitle element created');
    return translatedSubtitleElement;
  }
  
  function updateSubtitleStyles(translatedSubtitleElement, settings) {
    if (translatedSubtitleElement) {
      translatedSubtitleElement.style.fontSize = `${settings.fontSize}px`;
      translatedSubtitleElement.style.bottom = `${settings.verticalPosition}px`;
      translatedSubtitleElement.style.color = settings.fontColor;
      console.log('Updated translated subtitle styles:', settings);
    }
  }
  
  function clearTranslatedSubtitle(translatedSubtitleElement) {
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = '';
    }
  }