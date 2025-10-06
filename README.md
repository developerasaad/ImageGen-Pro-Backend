# ImageGen Pro Backend

Express.js backend for ImageGen Pro - handles image uploads to ImageKit and serves template manifest.

## Features

- Image upload to ImageKit with metadata storage
- Template manifest serving
- Metadata retrieval by filename
- Rate limiting and security headers
- CORS support for Android app

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your ImageKit credentials:

```bash
cp .env.example .env
```

Required variables:
- `IMAGEKIT_PUBLIC_KEY` - Your ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` - Your ImageKit private key
- `IMAGEKIT_URL_ENDPOINT` - Your ImageKit URL endpoint (e.g., https://ik.imagekit.io/your_id)

Optional variables:
- `PORT` - Server port (default: 3000)
- `BACKEND_API_KEY` - Optional API key for additional security
- `STORAGE_PATH` - Path for metadata storage (default: ./storage/metadata)

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### POST /upload

Upload an image to ImageKit and save metadata.

**Headers:**
- `X-API-KEY`: Optional backend API key
- `X-User-Id`: Optional user ID for tracking

**Body (multipart/form-data):**
- `file`: Image file (PNG, JPEG, WebP, max 10MB)
- `filename`: Filename (e.g., IMG_20251002_123456.png)
- `metadata`: JSON string with fields:
  ```json
  {
    "prompt": "...",
    "negative_prompt": "...",
    "style": "...",
    "aspect_ratio": "3:4",
    "model": "pollinations-1",
    "userId": "firebase-uid",
    "timestamp": "2025-10-02T12:34:56Z"
  }
  ```

**Response:**
```json
{
  "imageUrl": "https://ik.imagekit.io/...",
  "metadata": { /* full metadata object */ }
}
```

### GET /templates

Get list of all templates.

**Response:**
```json
[
  {
    "id": "IMG_20251002_123456.png",
    "imageUrl": "https://ik.imagekit.io/...",
    "thumbnailUrl": "https://ik.imagekit.io/...",
    "prompt": "...",
    "style": "...",
    "aspect_ratio": "16:9",
    "model": "pollinations-1",
    "timestamp": "2025-10-02T12:34:56Z"
  }
]
```

### GET /metadata/:filename

Get metadata for a specific image.

**Response:**
```json
{
  "filename": "IMG_20251002_123456.png",
  "imageUrl": "https://ik.imagekit.io/...",
  "prompt": "...",
  /* ... other metadata fields */
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T12:34:56.789Z"
}
```

## Storage Structure

Metadata files are stored in `./storage/metadata/` (or path specified in `STORAGE_PATH`):

```
storage/
└── metadata/
    ├── IMG_20251002_123456.png.json
    ├── IMG_20251002_123457.png.json
    └── ...
```

Each JSON file contains the full metadata for the corresponding image.

## Security

- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Rate limiting (100 requests per 15 minutes per IP)
- Filename sanitization to prevent path traversal
- File type validation (only images)
- File size limit (10MB)
- Optional API key authentication

## Error Handling

- 400: Bad request (missing fields, invalid data)
- 401: Unauthorized (invalid API key)
- 404: Not found
- 413: Payload too large (file > 10MB)
- 500: Internal server error

## Development

Run tests:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

## Deployment

### Render.com (Recommended)

1. Create a new Web Service on Render
2. Connect your repository
3. Set environment variables in Render dashboard
4. Deploy

### Other Platforms

The backend can be deployed to any Node.js hosting platform:
- Heroku
- Railway
- Fly.io
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

## Notes

- Backend does NOT include Firebase logic (handled by Android app)
- Backend does NOT perform image generation (handled by Android app)
- Backend only handles upload to ImageKit and metadata storage
- Metadata files are named exactly as `<filename>.json`
