(function() {
  'use strict';

  console.log('🚀 Cassidy extension content script loaded');

  function extractNameAndDate(subject) {
    const nameMatch = subject.match(/(Austin|Everett)/i);
    const dateMatch = subject.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    
    const name = nameMatch ? nameMatch[1] : 'Unknown';
    let date = 'Unknown';
    
    if (dateMatch) {
      const dateParts = dateMatch[1].split('/');
      if (dateParts.length === 3) {
        const month = dateParts[0].padStart(2, '0');
        const day = dateParts[1].padStart(2, '0');
        let year = dateParts[2];
        if (year.length === 2) {
          year = '20' + year;
        }
        date = `${year}-${month}-${day}`;
      }
    }
    
    return { name, date };
  }

  function isContentImage(img) {
    const src = img.src || '';
    const alt = img.alt || '';
    
    // Skip obvious UI elements
    const skipPatterns = ['icon', 'button', 'logo', 'comment', 'download', 'kaymbu', 'gmail'];
    const shouldSkip = skipPatterns.some(pattern => 
      src.toLowerCase().includes(pattern) || alt.toLowerCase().includes(pattern)
    );
    
    // Skip small images (likely icons)
    const width = parseInt(img.width) || parseInt(img.getAttribute('width')) || 0;
    const height = parseInt(img.height) || parseInt(img.getAttribute('height')) || 0;
    if ((width > 0 && width < 100) || (height > 0 && height < 100)) {
      return false;
    }
    
    return !shouldSkip && src.startsWith('http');
  }

  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.cassidy-notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'cassidy-notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      font-family: Arial, sans-serif;
      max-width: 300px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ${type === 'success' ? 'background: #4CAF50;' : ''}
      ${type === 'error' ? 'background: #f44336;' : ''}
      ${type === 'info' ? 'background: #2196F3;' : ''}
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 6000);
  }

  // STRICT: Function to check if current page shows a Cassidy email
  function isCassidyEmail() {
    console.log('🔍 Checking if Cassidy email...');
    
    // Must be viewing a specific email (not inbox list)
    const url = window.location.href;
    const isViewingSpecificEmail = url.match(/#(inbox|all|sent|drafts)\/[a-zA-Z0-9]+/);
    
    if (!isViewingSpecificEmail) {
      console.log('❌ Not viewing specific email, URL:', url);
      return false;
    }
    
    // VERY STRICT: Must have EXACT "Digest from Cassidy" phrase
    const pageContent = document.body.textContent;
    
    // Check 1: Must contain exact phrase "Digest from Cassidy"
    if (!pageContent.includes('Digest from Cassidy')) {
      console.log('❌ No "Digest from Cassidy" found');
      return false;
    }
    
    // Check 2: Must be from Kaymbu (sender check)
    const hasKaymbuSender = pageContent.includes('kaymbu.com') || 
                           pageContent.includes('Kaymbu') ||
                           pageContent.includes('Email From Kaymbu');
    
    if (!hasKaymbuSender) {
      console.log('❌ Not from Kaymbu sender');
      return false;
    }
    
    // Check 3: Must have typical Cassidy email elements
    const cassidyElements = [
      'Download All',
      'Comment',
      'Download this moment',
      'Send a comment'
    ];
    
    const foundElements = cassidyElements.filter(element => 
      pageContent.includes(element)
    );
    
    if (foundElements.length < 2) {
      console.log('❌ Not enough Cassidy elements found:', foundElements);
      return false;
    }
    
    // Check 4: Must have child name (Austin or Everett)
    const hasChildName = pageContent.includes('Austin') || pageContent.includes('Everett');
    
    if (!hasChildName) {
      console.log('❌ No child name (Austin/Everett) found');
      return false;
    }
    
    console.log('✅ ALL CHECKS PASSED - This is a Cassidy email!');
    return true;
  }

  function processCassidyEmail() {
    console.log('🔍 Processing Cassidy email...');
    showNotification('Processing email...', 'info');

    try {
      // Find email subject - try multiple approaches
      let subject = '';
      
      // Method 1: Look for title or subject elements
      const titleElements = document.querySelectorAll('h1, h2, h3, [role="heading"], .hP, .bog');
      for (const element of titleElements) {
        if (element.textContent.includes('Digest from Cassidy')) {
          subject = element.textContent.trim();
          break;
        }
      }
      
      // Method 2: Search page text
      if (!subject) {
        const pageText = document.body.textContent;
        const match = pageText.match(/([^\n]*Digest from Cassidy[^\n]*)/);
        if (match) {
          subject = match[1].trim();
        }
      }
      
      // Method 3: Check page title
      if (!subject && document.title.includes('Digest from Cassidy')) {
        subject = document.title;
      }

      if (!subject.includes('Digest from Cassidy')) {
        throw new Error('Not a Cassidy email. Please open a Cassidy digest email first.');
      }

      console.log('✅ Found subject:', subject);
      const { name, date } = extractNameAndDate(subject);
      console.log('📝 Extracted:', { name, date });

      // Find all images on the page
      const allImages = Array.from(document.querySelectorAll('img'));
      console.log(`🖼️ Found ${allImages.length} total images`);
      
      const contentImages = allImages.filter(isContentImage);
      console.log(`✅ Content images: ${contentImages.length}`);

      if (contentImages.length === 0) {
        throw new Error(`No content images found. Total images: ${allImages.length}`);
      }

      // Prepare download data
      const imageData = contentImages.map((img, index) => ({
        url: img.src,
        filename: `Cassidy_${name}_${date}_${index + 1}.jpg`
      }));

      console.log('📤 Sending to background:', imageData.length, 'images');

      // Send to background script
      chrome.runtime.sendMessage({
        action: 'downloadImages',
        images: imageData,
        emailInfo: { name, date, subject }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Runtime error:', chrome.runtime.lastError);
          showNotification('Extension communication error', 'error');
          return;
        }
        
        if (response?.success) {
          showNotification(`✅ Started downloading ${imageData.length} images!`, 'success');
        } else {
          showNotification(`❌ Download failed: ${response?.error || 'Unknown error'}`, 'error');
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      showNotification(error.message, 'error');
    }
  }

  // UPDATED: Smart button that only shows for Cassidy emails
  function updateButton() {
    const existingButton = document.querySelector('#cassidy-floating-btn');
    const url = window.location.href;
    
    console.log('🔍 updateButton called, URL:', url);
    
    // Don't show button in inbox list view
    if (url.includes('#inbox') && !url.includes('#inbox/')) {
      console.log('❌ In inbox list view - no button');
      if (existingButton) existingButton.remove();
      return;
    }
    
    if (isCassidyEmail()) {
      // Show button if it's a Cassidy email and button doesn't exist
      if (!existingButton) {
        console.log('✅ Cassidy email detected - showing button');
        
        const button = document.createElement('button');
        button.id = 'cassidy-floating-btn';
        button.innerHTML = '📥<br>Cassidy';
        button.style.cssText = `
          position: fixed;
          top: 150px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        `;
        
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'scale(1.1)';
          button.style.background = '#45a049';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'scale(1)';
          button.style.background = '#4CAF50';
        });
        
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          processCassidyEmail();
        });
        
        document.body.appendChild(button);
      } else {
        console.log('ℹ️ Button already exists for this Cassidy email');
      }
    } else {
      // Hide button if it's not a Cassidy email
      if (existingButton) {
        console.log('❌ Not a Cassidy email - hiding button');
        existingButton.remove();
      }
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Content script received:', request);
    
    if (request.action === 'processCassidyEmail') {
      try {
        processCassidyEmail();
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error in message handler:', error);
        sendResponse({ success: false, error: error.message });
      }
    }
    
    return true; // Keep message channel open
  });

  // Initialize and monitor for changes
  function init() {
    console.log('🚀 Initializing smart Cassidy extension');
    
    // Check immediately
    setTimeout(updateButton, 1000);
    
    // Monitor for navigation and content changes
    let lastUrl = location.href;
    let lastCheck = '';
    
    new MutationObserver(() => {
      const currentUrl = location.href;
      const currentContent = document.title + document.body.textContent.substring(0, 500);
      
      // Check if URL changed or significant content changed
      if (currentUrl !== lastUrl || currentContent !== lastCheck) {
        lastUrl = currentUrl;
        lastCheck = currentContent;
        
        console.log('🔄 Page changed, rechecking...');
        setTimeout(updateButton, 500);
      }
    }).observe(document, { 
      subtree: true, 
      childList: true,
      characterData: true 
    });
    
    // Also check periodically (backup)
    setInterval(updateButton, 3000);
  }

  // Start when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();