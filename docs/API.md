# API Reference

## Base URL

```
Production:  https://api.lumora.app/api/v1
Development: http://localhost:4000/api/v1
```

API documentation is also available via Swagger UI at `/api-docs` when the server is running.

---

## Authentication

### Bearer Token

Most protected endpoints require an access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens are short-lived (default: 15 minutes). Obtain one via `POST /auth/login` or `POST /auth/refresh`.

### Cookie Authentication

Refresh tokens are automatically transmitted via the `lumora_refresh` httpOnly cookie. The `/auth/refresh` endpoint reads this cookie to issue new access tokens.

---

## Response Envelope

All API responses follow a consistent envelope format.

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Message Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "body": ["field: validation error message"]
    }
  }
}
```

### Pagination Format

Paginated endpoints include a `meta` object:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Codes

| Code                  | HTTP Status | Description                                 |
| --------------------- | ----------- | ------------------------------------------- |
| `NOT_FOUND`           | 404         | Requested resource not found                |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication           |
| `FORBIDDEN`           | 403         | Insufficient permissions                    |
| `CONFLICT`            | 409         | Resource conflict (e.g., duplicate email)   |
| `VALIDATION_ERROR`    | 422         | Request body/query/params failed validation |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                           |

---

## Endpoints

### Auth Module

Base path: `/auth`

#### POST /auth/register

Register a new user account.

**Auth:** None

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Validation Rules:**

- `email`: Valid email address
- `password`: 8-128 characters, must contain uppercase, lowercase, and digit
- `name`: 2-64 characters

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "cm0...",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "role": "USER",
      "subscription": "FREE",
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Cookies:** Sets `lumora_refresh` (httpOnly, secure, sameSite: strict)

**Errors:** `409 CONFLICT` (email already in use), `422 VALIDATION_ERROR`

---

#### POST /auth/login

Authenticate with email and password.

**Auth:** None

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "rememberMe": false
}
```

**Validation Rules:**

- `email`: Valid email address
- `password`: Required
- `rememberMe`: Optional boolean (extends session to 30 days)

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "user": { ... }
  }
}
```

**Cookies:** Sets `lumora_refresh` (1 day without rememberMe, 30 days with)

**Errors:** `401 UNAUTHORIZED` (invalid credentials)

---

#### POST /auth/logout

Invalidate current session.

**Auth:** Bearer token (optional — if provided, session is invalidated server-side)

**Request Body:** None

**Response `200`:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies:** Clears `lumora_refresh`

---

#### POST /auth/refresh

Exchange a refresh token for a new access token pair (token rotation).

**Auth:** None (reads refresh token from cookie or body)

**Request Body** (alternative to cookie):

```json
{
  "refreshToken": "eyJ..."
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "user": { ... }
  }
}
```

**Cookies:** Rotates `lumora_refresh` (old cookie invalidated)

**Errors:** `401 UNAUTHORIZED` (invalid or expired refresh token)

---

#### POST /auth/forgot-password

Request a password reset email.

**Auth:** None

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

> Note: Response is identical whether the email exists or not (prevents email enumeration).

---

#### POST /auth/reset-password

Reset password using a token from the reset email.

**Auth:** None

**Request Body:**

```json
{
  "token": "a1b2c3d4...",
  "password": "NewPassword123"
}
```

**Validation Rules:**

- `token`: Required
- `password`: 8-128 characters

**Response `200`:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:** `401 UNAUTHORIZED` (invalid/expired token)

---

#### GET /auth/me

Get the currently authenticated user's profile.

**Auth:** Bearer token

**Response `200`:**

```json
{
  "success": true,
  "data": { ... user object ... }
}
```

---

#### GET /auth/google

Initiate Google OAuth login. Redirects to Google's consent screen.

**Auth:** None

**Response:** `302 Redirect` to Google

---

#### GET /auth/google/callback

Google OAuth callback endpoint.

**Auth:** Passport (handles authentication internally)

**Response:** `302 Redirect` to `{FRONTEND_URL}/auth/callback?accessToken={token}`

**Cookies:** Sets `lumora_refresh`

---

#### GET /auth/github

Initiate GitHub OAuth login. Redirects to GitHub's authorization page.

**Auth:** None

**Response:** `302 Redirect` to GitHub

---

#### GET /auth/github/callback

GitHub OAuth callback endpoint.

**Auth:** Passport (handles authentication internally)

**Response:** `302 Redirect` to `{FRONTEND_URL}/auth/callback?accessToken={token}`

**Cookies:** Sets `lumora_refresh`

---

### Blog Module

Base path: `/blog`

#### GET /blog/posts

List blog posts with pagination and filtering.

**Auth:** None (public)

**Query Parameters:**

| Parameter  | Type    | Default | Description                              |
| ---------- | ------- | ------- | ---------------------------------------- |
| `page`     | integer | `1`     | Page number                              |
| `limit`    | integer | `20`    | Items per page (max 100)                 |
| `sort`     | string  | —       | Sort field                               |
| `order`    | enum    | `desc`  | Sort order: `asc` or `desc`              |
| `status`   | enum    | —       | Filter: `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `search`   | string  | —       | Search in title                          |
| `authorId` | string  | —       | Filter by author ID                      |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cm0...",
      "title": "My Blog Post",
      "slug": "my-blog-post",
      "excerpt": "A short excerpt...",
      "content": "Full content...",
      "coverImage": "https://...",
      "author": {
        "id": "cm0...",
        "name": "John Doe",
        "avatar": null
      },
      "status": "PUBLISHED",
      "tags": ["tech", "tutorial"],
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

#### GET /blog/posts/:slug

Get a single blog post by its slug.

**Auth:** None (public)

**Path Parameters:**

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| `slug`    | string | Post slug (e.g., `my-blog-post`) |

**Response `200`:** Single blog post object

**Errors:** `404 NOT_FOUND`

---

#### POST /blog/posts

Create a new blog post.

**Auth:** Bearer token

**Request Body:**

```json
{
  "title": "My Blog Post",
  "excerpt": "A short excerpt",
  "content": "## Full content in markdown...",
  "coverImage": "https://example.com/image.jpg",
  "tags": ["tech", "tutorial"],
  "status": "DRAFT"
}
```

**Validation Rules:**

- `title`: 1-200 characters, required
- `excerpt`: 1-500 characters, required
- `content`: Required
- `coverImage`: Optional valid URL
- `tags`: Optional array, max 10 items
- `status`: Default `DRAFT`, or `PUBLISHED`

**Response `201`:** Created blog post object

**Audit Log:** Action `CREATE`, entity `BlogPost`

---

#### PUT /blog/posts/:id

Update an existing blog post.

**Auth:** Bearer token

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Post ID     |

**Request Body:** Any subset of `createPostSchema` fields:

```json
{
  "title": "Updated Title",
  "status": "PUBLISHED"
}
```

**Response `200`:** Updated blog post object

**Errors:** `403 FORBIDDEN` (not the author), `404 NOT_FOUND`

**Audit Log:** Action `UPDATE`, entity `BlogPost`

---

#### DELETE /blog/posts/:id

Delete a blog post.

**Auth:** Bearer token

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Post ID     |

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Post deleted" }
}
```

**Errors:** `403 FORBIDDEN` (not the author), `404 NOT_FOUND`

**Audit Log:** Action `DELETE`, entity `BlogPost`

---

### User Module

Base path: `/user`

All endpoints in this module require **Bearer token** authentication.

#### GET /user/profile

Get the current user's detailed profile.

**Auth:** Bearer token

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "cm0...",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "USER",
    "subscription": "FREE",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT /user/profile

Update the current user's profile.

**Auth:** Bearer token

**Request Body:**

```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Validation Rules:**

- `name`: Optional, 2-64 characters
- `avatar`: Optional valid URL

**Response `200`:** Updated user object

---

### Admin Module

Base path: `/admin`

All endpoints in this module require **Bearer token** + **ADMIN role**.

#### GET /admin/users

List all users (paginated).

**Auth:** Bearer token + ADMIN

**Query Parameters:**

| Parameter | Type    | Default | Description                          |
| --------- | ------- | ------- | ------------------------------------ |
| `page`    | integer | `1`     | Page number                          |
| `limit`   | integer | `20`    | Items per page                       |
| `search`  | string  | —       | Search by name or email              |
| `role`    | enum    | —       | Filter: `USER`, `ADMIN`, `MODERATOR` |

**Response `200`:** Paginated list of users

---

#### GET /admin/users/:id

Get a user by ID.

**Auth:** Bearer token + ADMIN

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | User ID     |

**Response `200`:** Full user details

---

#### PUT /admin/users/:id

Update a user's role.

**Auth:** Bearer token + ADMIN

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | User ID     |

**Request Body:**

```json
{
  "role": "MODERATOR"
}
```

**Validation:** Role must be `USER`, `MODERATOR`, or `ADMIN`

**Response `200`:** Updated user object

---

#### DELETE /admin/users/:id

Delete a user account.

**Auth:** Bearer token + ADMIN

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | User ID     |

**Response `200`:** Confirmation message

---

#### GET /admin/analytics

Get platform analytics data.

**Auth:** Bearer token + ADMIN

**Response `200`:** Analytics data object

---

#### GET /admin/logs

List audit logs (paginated).

**Auth:** Bearer token + ADMIN

**Query Parameters:**

| Parameter  | Type    | Default | Description           |
| ---------- | ------- | ------- | --------------------- |
| `page`     | integer | `1`     | Page number           |
| `limit`    | integer | `20`    | Items per page        |
| `search`   | string  | —       | Search in log entries |
| `severity` | string  | —       | Filter by severity    |

**Response `200`:** Paginated list of audit logs

---

### Media Module

Base path: `/media`

All endpoints require **Bearer token** authentication.

#### GET /media

List the current user's media files.

**Auth:** Bearer token

**Query Parameters:**

| Parameter | Type    | Default | Description                                   |
| --------- | ------- | ------- | --------------------------------------------- |
| `page`    | integer | `1`     | Page number                                   |
| `type`    | enum    | —       | Filter: `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT` |
| `search`  | string  | —       | Search by filename                            |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cm0...",
      "url": "https://res.cloudinary.com/...",
      "type": "IMAGE",
      "name": "photo.jpg",
      "size": 2048576,
      "mimeType": "image/jpeg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { ... }
}
```

---

#### POST /media/upload

Upload a media file.

**Auth:** Bearer token

**Request:** `multipart/form-data`

| Field  | Type   | Description               |
| ------ | ------ | ------------------------- |
| `file` | binary | File to upload (max 50MB) |

**Response `201`:**

```json
{
  "success": true,
  "data": { ... media file object ... }
}
```

**Supported types:** Images, videos, audio, documents (validated against Cloudinary capabilities)

---

#### DELETE /media/:id

Delete a media file.

**Auth:** Bearer token

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Media ID    |

**Response `200`:** Confirmation message

---

### Notifications Module

Base path: `/user/notifications`

All endpoints require **Bearer token** authentication.

#### GET /user/notifications

List the current user's notifications (paginated, newest first).

**Auth:** Bearer token

**Query Parameters:**

| Parameter | Type    | Default | Description |
| --------- | ------- | ------- | ----------- |
| `page`    | integer | `1`     | Page number |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cm0...",
      "type": "INFO",
      "title": "Welcome to Lumora!",
      "message": "Thanks for joining...",
      "read": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { ... }
}
```

---

#### GET /user/notifications/unread

Get the count of unread notifications.

**Auth:** Bearer token

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

#### PUT /user/notifications/:id/read

Mark a single notification as read.

**Auth:** Bearer token

**Path Parameters:**

| Parameter | Type   | Description     |
| --------- | ------ | --------------- |
| `id`      | string | Notification ID |

**Response `200`:** Confirmation message

---

#### PUT /user/notifications/read-all

Mark all notifications as read.

**Auth:** Bearer token

**Response `200`:**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### Search Module

Base path: `/search`

#### GET /search

Search across posts, users, and media.

**Auth:** None (public)

**Query Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `q`       | string | Yes      | Search term (minimum 2 characters) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "posts": [ ... ],
    "users": [ ... ],
    "media": [ ... ]
  }
}
```

---

### Health Check

#### GET /health

Check if the API server is running.

**Auth:** None

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
