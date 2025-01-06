const createTranslatedSubtitleElement = () => {
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
  
  const updateSubtitleStyles = (translatedSubtitleElement, settings) => {
    if (translatedSubtitleElement) {
      translatedSubtitleElement.style.fontSize = `${settings.fontSize}px`;
      translatedSubtitleElement.style.bottom = `${settings.verticalPosition}px`;
      translatedSubtitleElement.style.color = settings.fontColor;
      console.log('Updated translated subtitle styles:', settings);
    }
  }
  
  const clearTranslatedSubtitle = (translatedSubtitleElement) => {
    if (translatedSubtitleElement) {
      translatedSubtitleElement.textContent = '';
    }
  }
  
  const sanitizeSubtitleText = (text) => {
    return text.replace(/<[^>]*>/g, '').trim();
  }

  const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  export {
    createTranslatedSubtitleElement,
    updateSubtitleStyles,
    clearTranslatedSubtitle,
    sanitizeSubtitleText,
    debounce
  };