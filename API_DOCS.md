# ImageGen Pro Backend API Documentation

Base URL: `http://192.168.1.11:3000`

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T12:34:56.789Z",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl http://192.168.1.11:3000/health
```

---

### 2. Upload Image

**POST** `/upload`

Upload an image to ImageKit and save metadata.

**Request:**
- Content-Type: `multipart/form-data`
- Headers:
  - `X-User-Id` (optional): Firebase user ID
  - `X-API-KEY` (optional): API key if configured

**Form Data:**
- `file` (required): Image file (PNG, JPG, JPEG, WebP)
- `filename` (required): Filename (e.g., `IMG_1234567890.png`)
- `metadata` (required): JSON string with metadata

**Metadata JSON Schema:**
```json
{
  "prompt": "A cute cartoon fox in Ghibli style",
  "negative_prompt": "blur, watermark",
  "style": "Ghibli",
  "aspect_ratio": "3:4",
  "model": "pollinations-1",
  "userId": "firebase-uid-abc123",
  "timestamp": "2025-10-04T12:34:56Z"
}
```

**Response (200 OK):**
```json
{
  "imageUrl": "https://ik.imagekit.io/ImageGen/imagegen-pro/IMG_1234567890.png",
  "metadata": {
    "filename": "IMG_1234567890.png",
    "imageUrl": "https://ik.imagekit.io/ImageGen/imagegen-pro/IMG_1234567890.png",
    "thumbnailUrl": "https://ik.imagekit.io/ImageGen/imagegen-pro/IMG_1234567890.png",
    "fileId": "imagekit-file-id",
    "prompt": "A cute cartoon fox in Ghibli style",
    "negative_prompt": "blur, watermark",
    "style": "Ghibli",
    "aspect_ratio": "3:4",
    "model": "pollinations-1",
    "userId": "firebase-uid-abc123",
    "timestamp": "2025-10-04T12:34:56Z",
    "uploadedAt": "2025-10-04T12:35:00.123Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid file type
- `401 Unauthorized`: Invalid API key (if API key is configured)
- `413 Payload Too Large`: File exceeds 10MB limit
- `500 Internal Server Error`: Upload or processing failed

**Example (curl):**
```bash
curl -X POST http://192.168.1.11:3000/upload \
  -F "file=@/path/to/image.png" \
  -F "filename=IMG_1234567890.png" \
  -F 'metadata={"prompt":"A cute fox","style":"Ghibli","aspect_ratio":"1:1","model":"pollinations-1","userId":"user123","timestamp":"2025-10-04T12:34:56Z"}' \
  -H "X-User-Id: user123"
```

**Example (JavaScript/Axios):**
```javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('image.png'));
form.append('filename', 'IMG_1234567890.png');
form.append('metadata', JSON.stringify({
  prompt: 'A cute fox',
  style: 'Ghibli',
  aspect_ratio: '1:1',
  model: 'pollinations-1',
  userId: 'user123',
  timestamp: new Date().toISOString()
}));

const response = await axios.post('http://192.168.1.11:3000/upload', form, {
  headers: {
    ...form.getHeaders(),
    'X-User-Id': 'user123'
  }
});
```

---

### 3. Get Templates

**GET** `/templates`

Retrieve list of available templates.

**Response (200 OK):**
```json
[
  {
    "id": "template-1",
    "imageUrl": "https://ik.imagekit.io/ImageGen/templates/template1.png",
    "prompt": "A serene landscape with mountains",
    "style": "Realistic",
    "aspect_ratio": "16:9",
    "model": "pollinations-1",
    "timestamp": "2025-10-01T10:00:00Z"
  },
  {
    "id": "template-2",
    "imageUrl": "https://ik.imagekit.io/ImageGen/templates/template2.png",
    "prompt": "Futuristic city at night",
    "style": "Cyberpunk",
    "aspect_ratio": "9:16",
    "model": "pollinations-1",
    "timestamp": "2025-10-01T11:00:00Z"
  }
]
```

**Example:**
```bash
curl http://192.168.1.11:3000/templates
```

---

### 4. Get Metadata

**GET** `/metadata/:filename`

Retrieve metadata for a specific image.

**Parameters:**
- `filename`: Image filename (e.g., `IMG_1234567890.png`)

**Response (200 OK):**
```json
{
  "filename": "IMG_1234567890.png",
  "imageUrl": "https://ik.imagekit.io/ImageGen/imagegen-pro/IMG_1234567890.png",
  "prompt": "A cute cartoon fox in Ghibli style",
  "negative_prompt": "blur, watermark",
  "style": "Ghibli",
  "aspect_ratio": "3:4",
  "model": "pollinations-1",
  "userId": "firebase-uid-abc123",
  "timestamp": "2025-10-04T12:34:56Z",
  "uploadedAt": "2025-10-04T12:35:00.123Z"
}
```

**Error Responses:**
- `404 Not Found`: Metadata file not found

**Example:**
```bash
curl http://192.168.1.11:3000/metadata/IMG_1234567890.png
```

---

## File Storage

### Metadata Files

Metadata is stored as JSON files in `backend/storage/metadata/` with the naming convention:
```
<filename>.json
```

Example: `IMG_1234567890.png.json`

### ImageKit Storage

Images are uploaded to ImageKit with:
- Folder: `/imagegen-pro`
- Tags: `imagegen-pro`, model name, style
- Unique filename: Disabled (uses provided filename)

---

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# ImageKit Configuration (required)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/YourEndpoint

# Backend Configuration
PORT=3000
STORAGE_PATH=./storage/metadata

# Environment
NODE_ENV=development
```

### Security

- API key authentication is optional (disabled by default for development)
- File type validation: Only PNG, JPG, JPEG, WebP allowed
- File size limit: 10MB maximum
- Filename sanitization: Prevents path traversal attacks
- Rate limiting: 100 requests per 15 minutes per IP on upload endpoint

---

## Error Handling

All errors return JSON with the following structure:

```json
{
  "error": "Error message description"
}
```

In development mode, stack traces are included:

```json
{
  "error": "Error message",
  "stack": "Error stack trace..."
}
```

---

## Testing

Run the test script to verify all endpoints:

```bash
cd backend
node test-upload.js
```

Expected output:
```
✓ Health check passed
✓ Templates endpoint passed
✓ Upload successful!
```
