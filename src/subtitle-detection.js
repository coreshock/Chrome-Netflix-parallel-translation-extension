const detectSubtitles = () => {
  console.log('detectSubtitles called for:', window.location.hostname);

  if (window.location.hostname.includes('ardmediathek.de')) {
    console.log('ARD Mediathek detected, searching for subtitle container');
    
    // First, try to find the video player iframe
    const videoIframe = document.querySelector('iframe[src*="player"]');
    if (videoIframe) {
      console.log('Found video player iframe:', videoIframe);
      try {
        const iframeDocument = videoIframe.contentDocument || videoIframe.contentWindow.document;
        return findSubtitleElement(iframeDocument);
      } catch (e) {
        console.log('Cannot access iframe content due to same-origin policy:', e);
      }
    }
    
    // If no iframe or cannot access it, search in main document
    return findSubtitleElement(document);
  }

  // Netflix detection remains unchanged
  const netflixSubtitles = document.querySelector('.player-timedtext');
  if (netflixSubtitles) return netflixSubtitles;
  
  return document.querySelector('.player-timedtext-text-container');
};

const findSubtitleElement = (doc) => {
  console.log('Searching for subtitles in document:', doc);
  
  // Direct selectors for ARD subtitles
  const selectors = [
    '.ardplayer-subtitle',
    '[aria-label="Untertitel"]',
    '.ut-video-player__captions',
    '.player-subtitles',
    '[class*="subtitle"]',
    '[class*="captions"]'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      console.log('Found subtitle element with selector:', selector, element);
      return element;
    }
  }

  // Search by content and style patterns
  const allElements = doc.querySelectorAll('div, p, span');
  for (const element of allElements) {
    const style = window.getComputedStyle(element);
    const hasSubtitleCharacteristics = 
      element.textContent.trim() && 
      style.position === 'absolute' &&
      style.textAlign === 'center' &&
      (element.querySelector('span[style*="background"]') ||
       style.backgroundColor.includes('rgba') ||
       style.color === 'rgb(255, 255, 255)');

    if (hasSubtitleCharacteristics) {
      console.log('Found subtitle element by characteristics:', element);
      return element;
    }
  }

  console.log('No subtitle element found');
  return null;
};

const extractArdSubtitles = (container) => {
  if (!container) {
    console.log('No container provided to extractArdSubtitles');
    return [];
  }

  console.log('Extracting subtitles from container:', container);
  const subtitles = [];

  // Get all possible text-containing elements
  const textContainers = [
    ...container.querySelectorAll('span[style*="background"]'),
    ...container.querySelectorAll('p'),
    ...container.querySelectorAll('div > span'),
    container
  ];

  for (const element of textContainers) {
    const text = element.textContent.trim();
    if (text && !subtitles.some(sub => sub.text === text)) {
      console.log('Found subtitle text:', text);
      subtitles.push({ text, element });
    }
  }

  console.log('Extracted subtitles:', subtitles);
  return subtitles;
};

export { detectSubtitles, extractArdSubtitles };