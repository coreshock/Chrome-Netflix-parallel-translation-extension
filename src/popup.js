// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const subtitlesContainer = document.getElementById('subtitles-container');
  const statusElement = document.getElementById('status');

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs[0]) {
      const currentTabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        function: getSubtitles
      }, (results) => {
        if (chrome.runtime.lastError) {
          statusElement.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }

        if (results && results[0] && results[0].result) {
          const subtitles = results[0].result;
          if (subtitles.length > 0) {
            statusElement.textContent = 'Subtitles found:';
            subtitlesContainer.innerHTML = ''; // Clear previous subtitles
            subtitles.forEach(subtitle => {
              const subtitleDiv = document.createElement('div');
              subtitleDiv.classList.add('subtitle-line');
              subtitleDiv.textContent = subtitle.text;
              if (subtitle.color) {
                subtitleDiv.style.color = subtitle.color;
              }
              subtitlesContainer.appendChild(subtitleDiv);
            });
          } else {
            statusElement.textContent = 'No subtitles found on this page.';
          }
        } else {
          statusElement.textContent = 'Could not retrieve subtitles.';
        }
      });
    } else {
      statusElement.textContent = 'Error: Could not get current tab.';
    }
  });
});

function getSubtitles() {
  console.log("getSubtitles function called");
  return new Promise((resolve) => {
    let subtitles = [];

    const subtitleParagraphs = document.querySelectorAll('p[style*="text-align: center;"]');

    subtitleParagraphs.forEach(p => {
      const spans = p.querySelectorAll('span[style*="background-color: rgba"]');
      spans.forEach(span => {
        const text = span.textContent.trim();
        const colorMatch = span.getAttribute('style').match(/color: (.*?);/);
        const color = colorMatch ? colorMatch[1] : null;

        subtitles.push({ text: text, color: color });
      });
    });

    console.log("Subtitles found:", subtitles);
    resolve(subtitles);
  });
}