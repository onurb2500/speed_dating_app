# API Specification — Speed Dating App

**Base URL:** `http://localhost:3001` (dev) · `https://api.yourdomain.com` (prod)  
**Auth:** Bearer token in `Authorization` header unless marked `PUBLIC`  
**Content-Type:** `application/json` for all requests/responses  
**Error format:** `{ "error": { "code": "STRING_CODE", "message": "Human readable" } }`

---

## Auth — `/auth`

### POST `/auth/register` PUBLIC

Register a new user.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "MinLength8Chars!",
  "displayName": "Marina Silva"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "clx1234...",
    "email": "user@example.com",
    "displayName": "Marina Silva"
  }
}
```
Sets `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh`

**Errors:** `422 EMAIL_TAKEN` · `422 VALIDATION_ERROR`

---

### POST `/auth/login` PUBLIC

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "MinLength8Chars!"
}
```

**Response `200`:** Same shape as register  
**Errors:** `401 INVALID_CREDENTIALS` · `422 VALIDATION_ERROR`

---

### POST `/auth/refresh` PUBLIC (uses httpOnly cookie)

Rotate refresh token and get new access token.

**Request:** No body. Sends `refreshToken` cookie automatically.

**Response `200`:**
```json
{
  "accessToken": "eyJ..."
}
```
Sets new `refreshToken` cookie.

**Errors:** `401 INVALID_REFRESH_TOKEN` · `401 REFRESH_TOKEN_EXPIRED`

---

### POST `/auth/logout`

Revoke refresh token.

**Request:** No body.  
**Response `204`:** No content. Clears `refreshToken` cookie.

---

## Users — `/users`

### GET `/users/me`

Get current user's profile.

**Response `200`:**
```json
{
  "id": "clx1234...",
  "email": "user@example.com",
  "displayName": "Marina Silva",
  "avatarUrl": "https://...",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### PATCH `/users/me`

Update profile.

**Request body (all fields optional):**
```json
{
  "displayName": "Marina S.",
  "avatarUrl": "https://..."
}
```

**Response `200`:** Updated user object  
**Errors:** `422 VALIDATION_ERROR`

---

## Videos — `/videos`

### POST `/videos/upload-url`

Request a Mux Direct Upload URL. Must call this before uploading.

**Request body:**
```json
{
  "durationSeconds": 32.5
}
```

**Response `201`:**
```json
{
  "videoId": "clx9876...",
  "uploadUrl": "https://storage.googleapis.com/mux-....",
  "expiresAt": "2024-01-15T10:15:00Z"
}
```

**Errors:** `422 DURATION_EXCEEDS_LIMIT` (max 45s) · `429 RATE_LIMIT`

---

### POST `/videos/confirm`

Confirm that client has finished uploading to Mux URL.

**Request body:**
```json
{
  "videoId": "clx9876..."
}
```

**Response `200`:**
```json
{
  "videoId": "clx9876...",
  "status": "PROCESSING"
}
```

**Errors:** `404 VIDEO_NOT_FOUND` · `409 VIDEO_ALREADY_CONFIRMED`

---

### GET `/videos/:videoId/status`

Poll video processing status.

**Response `200`:**
```json
{
  "videoId": "clx9876...",
  "status": "READY",
  "playbackId": "abc123xyz",
  "duration": 32.5
}
```

`status` values: `PROCESSING` · `READY` · `FAILED`

---

### POST `/webhooks/mux` PUBLIC (Mux-signed)

Mux asset lifecycle webhook. **Not called by clients.**  
Validates `Mux-Signature` header. Processes `video.asset.ready` and `video.asset.errored` events.

**Response `200`:** `{ "received": true }`

---

### DELETE `/videos/:videoId`

Delete own video.

**Response `204`:** No content  
**Errors:** `404 VIDEO_NOT_FOUND` · `403 FORBIDDEN` (not owner)

---

## Feed — `/feed`

### GET `/feed`

Get the user's video feed (ordered pool of other users' ready videos).

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | — | Cursor for pagination (videoId of last seen) |
| `limit` | number | 10 | Items per page (max 20) |

**Response `200`:**
```json
{
  "items": [
    {
      "videoId": "clxABC...",
      "playbackId": "mux_playback_id",
      "duration": 28.3,
      "user": {
        "id": "clxUSR...",
        "displayName": "Lucas M.",
        "avatarUrl": "https://..."
      },
      "likeCount": 14,
      "commentCount": 3,
      "liked": false,
      "createdAt": "2024-01-14T18:00:00Z"
    }
  ],
  "nextCursor": "clxABC...",
  "hasMore": true
}
```

**Notes:**
- Excludes current user's own videos
- Excludes videos already seen in current session (client sends seen IDs via header `X-Seen-Videos: id1,id2,id3`)
- Result is cached in Redis per user (5min TTL)
- Feed items include `likeCount` and `commentCount` for display in the UI

---

## Likes — `/videos/:videoId/likes`

### POST `/videos/:videoId/likes`

Like a video. Idempotent — liking twice has no effect.

**Response `200`:**
```json
{ "likeCount": 42, "liked": true }
```

**Errors:** `404 VIDEO_NOT_FOUND`

---

### DELETE `/videos/:videoId/likes`

Unlike a video.

**Response `200`:**
```json
{ "likeCount": 41, "liked": false }
```

**Errors:** `404 VIDEO_NOT_FOUND`

---

## Comments — `/videos/:videoId/comments`

### GET `/videos/:videoId/comments`

Get paginated comments for a video.

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | — | Cursor for pagination |
| `limit` | number | 20 | Items per page (max 50) |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "clxCOM...",
      "text": "Que vídeo incrível!",
      "user": {
        "id": "clxUSR...",
        "displayName": "Ana P.",
        "avatarUrl": "https://..."
      },
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "nextCursor": "clxCOM...",
  "hasMore": false
}
```

---

### POST `/videos/:videoId/comments`

Post a comment on a video.

**Request body:**
```json
{ "text": "Que vídeo incrível!" }
```

`text`: 1–280 characters.

**Response `201`:**
```json
{
  "id": "clxCOM...",
  "text": "Que vídeo incrível!",
  "user": { "id": "clxUSR...", "displayName": "Ana P.", "avatarUrl": "https://..." },
  "createdAt": "2024-01-15T12:00:00Z"
}
```

**Errors:** `404 VIDEO_NOT_FOUND` · `422 VALIDATION_ERROR`

---

### DELETE `/videos/:videoId/comments/:commentId`

Delete own comment.

**Response `204`:** No content  
**Errors:** `404 NOT_FOUND` · `403 FORBIDDEN`

---

## Error Codes Reference

| HTTP | Code | Description |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password |
| 401 | `INVALID_REFRESH_TOKEN` | Refresh token invalid or revoked |
| 403 | `FORBIDDEN` | Authenticated but not authorized |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | State conflict (e.g. already confirmed) |
| 422 | `VALIDATION_ERROR` | Request body failed Zod validation |
| 422 | `EMAIL_TAKEN` | Email already registered |
| 422 | `DURATION_EXCEEDS_LIMIT` | Video > 45 seconds |
| 422 | `COMMENT_TOO_LONG` | Comment exceeds 280 characters |
| 429 | `RATE_LIMIT` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Rate Limits

| Endpoint group | Limit |
|---|---|
| `POST /auth/login` | 10 req / 15 min per IP |
| `POST /auth/register` | 5 req / 15 min per IP |
| `POST /videos/upload-url` | 20 req / hour per user |
| `POST /videos/:id/comments` | 30 req / 15 min per user |
| All other authenticated | 100 req / 15 min per user |
| All other unauthenticated | 60 req / 15 min per IP |
