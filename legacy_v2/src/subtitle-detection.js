function detectSubtitles() {
    console.log('Detecting subtitles...');
  
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