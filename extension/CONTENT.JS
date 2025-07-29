// Complete content.js with fixed date extraction
(function() {
  'use strict';

  console.log('🚀 Cassidy extension content script loaded');

  // Helper function to convert month names to numbers
  function getMonthNumber(monthName) {
    const months = {
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    return months[monthName.toLowerCase()] || '01';
  }

  // Helper function to format date consistently
  function formatDate(dateString) {
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const month = dateParts[0].padStart(2, '0');
      const day = dateParts[1].padStart(2, '0');
      let year = dateParts[2];
      
      // Handle 2-digit years (assume 2000s)
      if (year.length === 2) {
        year = parseInt(year) > 50 ? '19' + year : '20' + year;
      }
      
      return `${year}-${month}-${day}`;
    }
    return dateString;
  }

  // UPDATED extractNameAndDate function with better date detection
  function extractNameAndDate(subject) {
    console.log('🔍 Extracting from subject:', subject);
    
    // Extract name (Austin/Everett)
    const nameMatch = subject.match(/(Austin|Everett)/i);
    const name = nameMatch ? nameMatch[1] : 'Unknown';
    
    // Try multiple date patterns from Cassidy emails
    let date = 'Unknown';
    
    // Pattern 1: "for MM/DD/YY" or "for MM/DD/YYYY" (most common in Cassidy emails)
    const datePattern1 = subject.match(/for\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (datePattern1) {
      date = formatDate(datePattern1[1]);
      console.log('✅ Found date pattern "for MM/DD/YY":', date);
    }
    
    // Pattern 2: "MM/DD/YY" or "MM/DD/YYYY" anywhere in subject
    if (date === 'Unknown') {
      const datePattern2 = subject.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      if (datePattern2) {
        date = formatDate(datePattern2[1]);
        console.log('✅ Found date pattern "MM/DD/YY":', date);
      }
    }
    
    // Pattern 3: Try to find date in email content if subject fails
    if (date === 'Unknown') {
      console.log('🔍 Looking for date in email content...');
      const emailContent = document.body.textContent;
      
      // Look for "Month DD, YYYY" format common in email headers
      const monthPattern = emailContent.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i);
      if (monthPattern) {
        const monthName = monthPattern[1];
        const day = monthPattern[2].padStart(2, '0');
        const year = monthPattern[3];
        const monthNum = getMonthNumber(monthName);
        date = `${year}-${monthNum}-${day}`;
        console.log('✅ Found date in content "Month DD, YYYY":', date);
      }
    }
    
    // Pattern 4: Gmail's email timestamp (last resort)
    if (date === 'Unknown') {
      console.log('🔍 Looking for Gmail timestamp...');
      const timestamps = document.querySelectorAll('[data-date], .g3, .go, time');
      for (const timestamp of timestamps) {
        const dateText = timestamp.textContent || timestamp.getAttribute('data-date') || timestamp.getAttribute('datetime');
        if (dateText && dateText.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
          date = formatDate(dateText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)[1]);
          console.log('✅ Found date in Gmail timestamp:', date);
          break;
        }
      }
    }
    
    console.log('📝 Final extracted - Name:', name, 'Date:', date);
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

  // UPDATED processCassidyEmail function with better subject detection
  function processCassidyEmail() {
    console.log('🔍 Processing Cassidy email...');
    showNotification('Processing email...', 'info');

    try {
      // IMPROVED: Find email subject with better detection
      let subject = '';
      
      // Method 1: Look for Gmail subject elements first
      const gmailSubjectSelectors = [
        '.hP',           // Gmail subject line
        '.bog',          // Gmail subject
        'h2',            // Headers
        '[role="heading"]'
      ];
      
      for (const selector of gmailSubjectSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent.trim();
          if (text.includes('Digest from Cassidy')) {
            subject = text;
            console.log('✅ Found subject in Gmail element:', subject);
            break;
          }
        }
        if (subject) break;
      }
      
      // Method 2: Check page title
      if (!subject && document.title.includes('Digest from Cassidy')) {
        subject = document.title;
        console.log('✅ Found subject in page title:', subject);
      }
      
      // Method 3: Look for subject pattern in email body
      if (!subject) {
        const emailContent = document.body.textContent;
        const subjectMatch = emailContent.match(/([^.\n]*Digest from Cassidy[^.\n]*)/);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          console.log('✅ Found subject in email content:', subject);
        }
      }

      if (!subject.includes('Digest from Cassidy')) {
        throw new Error('Not a Cassidy email. Please open a Cassidy digest email first.');
      }

      console.log('✅ Final subject for parsing:', subject);
      const { name, date } = extractNameAndDate(subject);
      console.log('📝 Extracted data:', { name, date });

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
      console.log('📝 Sample filename:', imageData[0]?.filename);

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