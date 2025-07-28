# Cassidy Email Image Downloader

A Chrome/Edge browser extension that automatically downloads images from Cassidy school digest emails with proper naming and organization.

## 🎯 Features

- **Smart Detection**: Only shows download button on actual Cassidy digest emails
- **Automatic Downloads**: Downloads all images without save dialogs
- **Perfect Naming**: Files named as `Cassidy_[Child]_[Date]_[#].jpg`
- **Organized Storage**: Saves to `Downloads/Cassidy_Images/` folder
- **One-Click Operation**: Single button downloads all images from the email
- **Content Filtering**: Skips UI icons and only downloads actual photo content

## 📋 Prerequisites

- Chrome or Edge browser
- Gmail account with Cassidy school emails
- Browser downloads set to automatic (no save dialogs)

## 🚀 Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download this repository**
   ```bash
   git clone https://github.com/yourusername/cassidy-image-downloader.git
   cd cassidy-image-downloader
   ```

2. **Open your browser's extension page**
   - **Chrome**: Go to `chrome://extensions/`
   - **Edge**: Go to `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `extension/` folder from this repository

5. **Configure browser downloads** (Important!)
   - Go to browser Settings → Downloads
   - Turn OFF "Ask me what to do with each download"
   - This allows automatic downloads without save dialogs

## 📁 Project Structure

```
cassidy-image-downloader/
├── extension/
│   ├── manifest.json          # Extension configuration
│   ├── content.js            # Main logic and UI
│   ├── background.js         # Download handling
│   ├── popup.html           # Extension popup interface
│   └── popup.js             # Popup functionality
├── README.md                # This file
└── INSTALLATION.md          # Detailed setup guide
```

## 🎮 Usage

1. **Open Gmail** and navigate to a Cassidy digest email
2. **Look for the green button** - A floating green "📥 Cassidy" button will appear on the right side
3. **Click to download** - All images will automatically download to `Downloads/Cassidy_Images/`
4. **Check your downloads** - Files will be named like `Cassidy_Austin_2020-07-31_1.jpg`

### File Naming Convention

```
Cassidy_[ChildName]_[YYYY-MM-DD]_[ImageNumber].jpg

Examples:
- Cassidy_Austin_2020-07-31_1.jpg
- Cassidy_Austin_2020-07-31_2.jpg
- Cassidy_Everett_2020-03-07_1.jpg
```

## 🔧 Technical Details

### How It Works

1. **Email Detection**: Monitors Gmail for emails containing "Digest from Cassidy"
2. **Content Analysis**: Identifies actual photo content vs UI elements
3. **Smart Filtering**: Skips icons, buttons, and small images
4. **Batch Download**: Uses Chrome Downloads API for reliable, automatic downloads
5. **File Organization**: Creates organized folder structure with meaningful names

### Supported Email Formats

- Kaymbu school digest emails
- Emails with subject containing "Digest from Cassidy"
- Emails mentioning "Austin" or "Everett" (easily customizable)

## 🛠️ Customization

### Adding More Child Names

Edit `content.js` line ~8:
```javascript
const nameMatch = subject.match(/(Austin|Everett|YourChildName)/i);
```

### Changing Download Location

Edit `background.js` line ~20:
```javascript
filename: `Your_Folder_Name/${image.filename}`,
```

### Adjusting Image Filtering

Edit the `isContentImage()` function in `content.js` to modify which images are downloaded.

## 🐛 Troubleshooting

### Button Doesn't Appear
- Make sure you're viewing a Cassidy email (not inbox list)
- Check browser console (F12) for error messages
- Verify the email contains "Digest from Cassidy" in the subject

### Downloads Don't Start
- Check browser download settings
- Ensure "Ask me what to do with each download" is OFF
- Verify extension has download permissions

### Files Not Saving
- Check your Downloads folder for `Cassidy_Images` subfolder
- Verify browser isn't blocking downloads from extensions
- Try refreshing the page and extension

## 🔒 Privacy & Security

- **Local Processing**: All processing happens locally in your browser
- **No Data Collection**: Extension doesn't send any data to external servers
- **Gmail Only**: Only activates on mail.google.com
- **Minimal Permissions**: Only requests necessary browser permissions

## 📜 Permissions Explained

- `activeTab`: Access current Gmail tab
- `downloads`: Download images to your computer
- `storage`: Store extension preferences
- `tabs`: Communicate between extension components
- `*://mail.google.com/*`: Only works on Gmail
- `*://*.kaymbu.com/*`: Access Kaymbu-hosted images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for parents to easily save their children's school memories
- Designed specifically for Cassidy school's Kaymbu email format
- Inspired by the need to preserve precious moments efficiently

---

**Made with ❤️ for busy parents who want to keep every memory** 📸

---

# 📁 Extension Files

## manifest.json
```json
{
  "manifest_version": 3,
  "name": "Cassidy Image Downloader",
  "version": "1.1",
  "description": "Downloads images from Cassidy emails automatically",
  "permissions": [
    "activeTab",
    "downloads",
    "storage",
    "tabs"
  ],
  "host_permissions": [
    "*://mail.google.com/*",
    "*://*.kaymbu.com/*",
    "*://*/*"
  ],
  "content_scripts": [
    {
      "matches": ["*://mail.google.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Cassidy Image Downloader"
  }
}
```

## content.js
```javascript
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
```

## background.js
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'downloadImages') {
    console.log('Starting silent image downloads...');
    downloadImages(request.images, request.emailInfo)
      .then((result) => {
        console.log('Download completed:', result);
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Download error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function downloadImages(images, emailInfo) {
  console.log(`Starting silent download of ${images.length} images for ${emailInfo.name}`);
  
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    try {
      console.log(`Downloading ${image.filename}...`);
      
      // Force silent download - no save dialog
      const downloadId = await chrome.downloads.download({
        url: image.url,
        filename: `Cassidy_Images/${image.filename}`,
        saveAs: false,           // Never show save dialog
        conflictAction: 'uniquify' // Auto-rename if file exists
      });
      
      console.log(`✅ Download started with ID ${downloadId}: ${image.filename}`);
      results.push({ success: true, filename: image.filename, downloadId });
      
      // Shorter delay for faster downloads
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.error(`❌ Failed to download ${image.filename}:`, error);
      results.push({ success: false, filename: image.filename, error: error.message });
    }
  }
  
  console.log('All downloads processed:', results);
  return results;
}
```

## popup.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 300px;
      padding: 15px;
      font-family: Arial, sans-serif;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
    }
    .button {
      width: 100%;
      padding: 12px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      margin: 5px 0;
    }
    .button:hover {
      background: #45a049;
    }
    .info {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h3>📥 Cassidy Downloader</h3>
  </div>
  
  <button id="downloadBtn" class="button">
    Download Images from Current Email
  </button>
  
  <div class="info">
    <strong>Instructions:</strong><br>
    1. Open a Cassidy email in Gmail<br>
    2. Click the download button above<br>
    3. Images will save to Downloads/Cassidy_Images/<br><br>
    
    <strong>File naming:</strong><br>
    Cassidy_[Austin/Everett]_[Date]_[#].jpg
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

## popup.js
```javascript
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
```

## INSTALLATION.md

# Detailed Installation Guide

## Prerequisites
- Chrome or Edge browser
- Gmail account with Cassidy school emails
- Basic computer skills

## Step-by-Step Installation

### 1. Download the Extension
- Download this repository as a ZIP file
- Extract to a folder (e.g., `Documents/cassidy-extension/`)

### 2. Configure Browser Downloads
**This step is crucial for automatic downloads:**

#### For Edge:
1. Open Edge Settings (`edge://settings/downloads`)
2. Turn OFF "Ask me what to do with each download"
3. Set download location if desired

#### For Chrome:
1. Open Chrome Settings (`chrome://settings/downloads`)
2. Turn OFF "Ask where to save each file before downloading"
3. Set download location if desired

### 3. Install Extension
1. Open extension management page:
   - **Edge**: `edge://extensions/`
   - **Chrome**: `chrome://extensions/`

2. Enable "Developer mode" (toggle in top-right)

3. Click "Load unpacked"

4. Select the `extension/` folder from where you extracted the files

5. The extension should now appear in your browser

### 4. Test the Installation
1. Open Gmail
2. Navigate to a Cassidy digest email
3. Look for the green floating button on the right side
4. Click it to test downloading

## Troubleshooting

### Extension Not Loading
- Check that all 5 files are in the extension folder
- Ensure Developer mode is enabled
- Try refreshing the extension page

### Button Not Appearing
- Make sure you're viewing a Cassidy email (not inbox list)
- Check browser console for errors (F12)
- Try refreshing the Gmail page

### Downloads Not Working
- Verify browser download settings are configured
- Check if browser is blocking downloads
- Ensure adequate disk space

## Support
If you encounter issues, check the browser console (F12) for error messages and refer to the main README for troubleshooting tips.
