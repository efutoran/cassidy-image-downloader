document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  
  downloadBtn.addEventListener('click', async function() {
    downloadBtn.textContent = 'Processing...';
    downloadBtn.disabled = true;
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      if (!tab.url.includes('mail.google.com')) {
        throw new Error('Please open a Gmail tab first');
      }
      
      console.log('Sending message to tab:', tab.id);
      
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'processCassidyEmail' 
      });
      
      console.log('Response from content script:', response);
      
      if (response?.success) {
        downloadBtn.textContent = '✅ Processing Started!';
        setTimeout(() => window.close(), 2000);
      } else {
        throw new Error(response?.error || 'Unknown error from content script');
      }
      
    } catch (error) {
      console.error('Popup error:', error);
      downloadBtn.textContent = 'Error - Try Again';
      
      // Show error in popup
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        color: red;
        font-size: 12px;
        margin-top: 10px;
        padding: 10px;
        background: #ffebee;
        border-radius: 3px;
      `;
      errorDiv.textContent = error.message;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        downloadBtn.textContent = 'Download Images from Current Email';
        downloadBtn.disabled = false;
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 3000);
    }
  });
});