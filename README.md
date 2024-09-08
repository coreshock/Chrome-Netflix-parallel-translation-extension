# Subtitle Translator Chrome Extension

This Chrome extension adds real-time translation capabilities to Netflix subtitles, allowing users to view subtitles in their preferred language.

## Features

- Real-time translation of Netflix subtitles
- Customizable font size and position for translated subtitles
- Support for multiple languages
- Uses LibreTranslate for translations
- Built-in LibreTranslate server management

## Installation

1. Clone this repository or download the ZIP file.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the `src` folder from this project.

## Usage

1. Open a video on Netflix.
2. Click the extension icon to open the settings popup.
3. Choose your source and target languages, adjust font size and position as needed.
4. Use the "Check Server Status" button to ensure the LibreTranslate server is running.
5. If the server is not running, click "Launch Server" to start it.
6. Enable translation and enjoy your video with translated subtitles!

## LibreTranslate Server Setup

The extension now includes functionality to manage the LibreTranslate server. For detailed setup instructions, click the "Server Setup Instructions" link in the extension popup.

Key steps:
1. Install LibreTranslate on your system.
2. Set up the native messaging host for server management.
3. Use the extension popup to launch and stop the server as needed.

## Configuration

The extension uses a local LibreTranslate server for translations. The server URL is set to:

```javascript
const apiUrl = 'http://localhost:5000/translate';  // LibreTranslate server URL
```

## Troubleshooting

If you encounter the "ERR_BLOCKED_BY_CLIENT" error:
1. Check your antivirus or firewall settings, they might be blocking the extension.
2. Ensure that the LibreTranslate server is running on localhost:5000.
3. Verify that the native messaging host is set up correctly.

## Upcoming Features

- YouTube subtitle translation support
- Integration with Azure Translation API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.