chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'downloadImages') {
    console.log('Starting image downloads...');
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
  console.log(`Starting download of ${images.length} images for ${emailInfo.name}`);
  
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    try {
      console.log(`Downloading ${image.filename}...`);
      
      // Try to download the image
      const downloadId = await chrome.downloads.download({
        url: image.url,
        filename: `Cassidy_Images/${image.filename}`,
        saveAs: false,
        conflictAction: 'uniquify'
      });
      
      console.log(`✅ Download started with ID ${downloadId}: ${image.filename}`);
      results.push({ success: true, filename: image.filename, downloadId });
      
      // Small delay between downloads
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
    } catch (error) {
      console.error(`❌ Failed to download ${image.filename}:`, error);
      results.push({ success: false, filename: image.filename, error: error.message });
    }
  }
  
  console.log('All downloads processed:', results);
  return results;
}