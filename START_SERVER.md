# Starting the Backend Server

## Quick Start

1. Make sure you're in the backend directory
2. Run one of these commands:

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## Testing the Server

After starting, test it with:
```bash
node test-upload.js
```

## Important Notes

- Server listens on `0.0.0.0:3000` (accessible from network)
- Your app should connect to `http://192.168.1.11:3000/`
- API key check is disabled for development
- Images are uploaded to ImageKit
- Metadata is saved to `./storage/metadata/`

## Troubleshooting

If the server won't start:
1. Check if port 3000 is already in use
2. Verify ImageKit credentials in `.env`
3. Make sure `node_modules` are installed: `npm install`

If uploads fail:
1. Check server logs for errors
2. Verify ImageKit credentials are correct
3. Run `node test-upload.js` to test locally
