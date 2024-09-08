function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  function sanitizeSubtitleText(text) {
    text = text.replace(/([.!?]+)(?=[^\n])/g, '$1\n');
    text = text.replace(/([^\n])([-*])/g, '$1\n$2');
    text = text.replace(/(\.\.\.)([^\s-])/g, '$1 $2');
    return text.trim().replace(/\s\s+/g, ' ');
  }