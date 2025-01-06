const detectSubtitles = () => {
  console.log('detectSubtitles called');

  if (window.location.hostname.includes('ardmediathek.de')) {
    console.log('ARD Mediathek detected');
    
    // Enhanced ARD subtitle detection
    const findArdSubtitles = () => {
      console.log('findArdSubtitles called');
      
      // Try multiple methods to find ARD subtitles
      const selectors = [
        // Primary selectors for subtitle containers
        '.ardplayer-subtitle',
        '[aria-label="Untertitel"]',
        '.video-player__captions',
        // Backup selectors based on styling
        'div[style*="font-family: Verdana"][style*="text-align: center"]',
        'div[style*="direction: ltr"][style*="text-align: center"]',
        'p[style*="direction: ltr"][style*="text-align: center"]',
        // Additional backup selectors
        'div.player-subtitles',
        '.ut-video-player__captions'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Verify it's a subtitle element by checking content or style
          if (element.textContent.trim() && 
              (element.style.position === 'absolute' || 
               element.style.textAlign === 'center')) {
            console.log('ARD subtitle element found:', element);
            return element;
          }
        }
      }

      // If no element found through selectors, try finding by characteristics
      const allElements = document.querySelectorAll('div, p');
      for (const element of allElements) {
        const style = window.getComputedStyle(element);
        if (style.position === 'absolute' && 
            style.textAlign === 'center' && 
            element.textContent.trim() && 
            (element.querySelector('span[style*="background-color"]') || 
             style.backgroundColor.includes('rgba'))) {
          console.log('ARD subtitle element found by characteristics:', element);
          return element;
        }
      }
      
      console.log('No ARD subtitles found');
      return null;
    };

    return findArdSubtitles();
  }

  // Netflix subtitle detection remains unchanged
  const netflixSubtitles = document.querySelector('.player-timedtext');
  if (netflixSubtitles) {
    console.log('Netflix subtitles detected:', netflixSubtitles);
    return netflixSubtitles;
  }

  const alternateNetflixSubtitles = document.querySelector('.player-timedtext-text-container');
  if (alternateNetflixSubtitles) {
    console.log('Alternate Netflix subtitles detected:', alternateNetflixSubtitles);
    return alternateNetflixSubtitles;
  }

  console.log('No subtitles detected');
  return null;
};

const extractArdSubtitles = (container) => {
  if (!container) return [];
  console.log("Extracting ARD subtitles from container:", container);

  let subtitles = [];
  try {
    // Look for subtitle text in various container types
    const textElements = [
      ...container.querySelectorAll('span[style*="background-color"]'),
      ...container.querySelectorAll('p[style*="text-align: center"]'),
      ...container.querySelectorAll('div[style*="text-align: center"]')
    ];

    textElements.forEach(element => {
      const text = element.textContent.trim();
      if (text) {
        // Avoid duplicate subtitles
        if (!subtitles.some(sub => sub.text === text)) {
          subtitles.push({
            text: text,
            element: element
          });
        }
      }
    });

    // If no subtitles found through specific elements, try direct container text
    if (subtitles.length === 0 && container.textContent.trim()) {
      subtitles.push({
        text: container.textContent.trim(),
        element: container
      });
    }

  } catch (error) {
    console.error('Error extracting ARD subtitles:', error);
  }

  console.log("Extracted subtitles:", subtitles);
  return subtitles;
};

export { detectSubtitles, extractArdSubtitles };