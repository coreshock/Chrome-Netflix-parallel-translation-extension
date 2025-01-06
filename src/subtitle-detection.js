function detectSubtitles() {
  console.log('Detecting subtitles...');

  // Check if we're on ARD Mediathek
  if (window.location.hostname.includes('ardmediathek.de')) {
    // Look for subtitle containers with specific styling patterns
    const findArdSubtitles = () => {
      // Find elements that match ARD's subtitle styling pattern
      const allElements = document.querySelectorAll('p');
      for (const element of allElements) {
        // Check if element matches ARD subtitle characteristics
        if (
          element.style.direction === 'ltr' &&
          element.style.fontFamily?.includes('Verdana') &&
          element.style.textAlign === 'center' &&
          // Look for child spans that typically contain the actual subtitle text
          element.querySelector('span[style*="background-color: rgba(0, 0, 0"]')
        ) {
          console.log('ARD Mediathek subtitles detected via styling:', element);
          return element;
        }
      }
     
      // Backup methods if the above fails
      const backupSelectors = [
        '.ut-video-player__captions',
        '.ardplayer-subtitle',
        '[aria-label="Untertitel"]',
        // Add more specific selectors based on video player iframe content
        'div[style*="font-family: Verdana"][style*="text-align: center"]',
        'p[style*="font-family: Verdana"][style*="text-align: center"]'
      ];
     
      for (const selector of backupSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log('ARD Mediathek subtitles detected via selector:', selector, element);
          return element;
        }
      }
     
      return null;
    };

    const ardSubtitles = findArdSubtitles();
    if (ardSubtitles) return ardSubtitles;
  }

  // Netflix subtitle detection
  const netflixSubtitles = document.querySelector('.player-timedtext');
  if (netflixSubtitles) {
    console.log('Netflix subtitles detected:', netflixSubtitles);
    return netflixSubtitles;
  }

  // Additional Netflix subtitle detection methods
  const alternateNetflixSubtitles = document.querySelector('.player-timedtext-text-container');
  if (alternateNetflixSubtitles) {
    console.log('Alternate Netflix subtitles detected:', alternateNetflixSubtitles);
    return alternateNetflixSubtitles;
  }

  console.log('No subtitles detected.');
  return null;
}

function extractArdSubtitles(container) {
  console.log("extractArdSubtitles function called");
  let subtitles = [];

  const subtitleParagraphs = container.querySelectorAll('p[style*="text-align: center;"]');

  subtitleParagraphs.forEach(p => {
    const spans = p.querySelectorAll('span[style^="margin:"]'); // Target spans with style starting with "margin:"
    spans.forEach(span => {
      const text = span.textContent.trim();
      const style = span.getAttribute('style');
      console.log("Style Attribute (Targeted):", style);

      let color = null;
      const colorMatch = style && style.match(/color: (.*?);/);
      console.log("Color Match (Targeted):", colorMatch);

      if (colorMatch) {
        color = colorMatch[1];
      }

      subtitles.push({ text: text, color: color });
    });
  });

  console.log("Subtitles found:", subtitles);
  return subtitles;
}