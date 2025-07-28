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
