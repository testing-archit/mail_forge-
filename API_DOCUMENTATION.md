# MailForge - Complete API Documentation

**API Version**: 1.0.0  
**Base URL**: `http://localhost:8080/app/v1`  
**Last Updated**: April 19, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Auth Service API](#auth-service-api)
6. [User Service API](#user-service-api)
7. [Mail Service API](#mail-service-api)
8. [Status Codes](#status-codes)
9. [Rate Limiting](#rate-limiting)
10. [API Gateway Routes](#api-gateway-routes)

---

## Overview

MailForge uses a microservices architecture with an API Gateway that routes requests to specialized services:

- **Auth Service** (Port 8081) - User authentication, registration, JWT tokens
- **User Service** (Port 8082) - User profiles, mail configuration
- **Mail Service** (Port 8083) - Email operations, storage, verification
- **API Gateway** (Port 8080) - Central request routing with JWT validation

All requests go through the API Gateway, which validates JWT tokens and routes to appropriate services.

---

## Authentication

### JWT Token-Based Authentication

The API uses JWT (JSON Web Token) for authentication. Tokens are obtained through login and must be included in subsequent requests.

#### Getting a Token

1. **Register** - Create a new account
2. **Verify** - Verify account with OTP
3. **Login** - Authenticate and receive JWT token

#### Using Token in Requests

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

#### Token Properties

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 24 hours (86400000 ms)
- **Contains**: user ID, username, permissions

#### Public Endpoints (No Auth Required)

- `POST /user/create` - User registration
- `PATCH /user/verify` - Account verification
- `GET /user/resend-otp` - OTP resending
- `POST /public/login` - User login
- `GET /actuator/health` - Health checks

#### Protected Endpoints (Auth Required)

All other endpoints require a valid JWT token in the Authorization header.

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "message": "Operation successful",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "status": "OK"
}
```

### Error Response

```json
{
  "message": "Error description",
  "data": "Detailed error information",
  "status": "BAD_REQUEST"
}
```

### Response Structure

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Human-readable message |
| `data` | object/array/string | Response data (empty for delete operations) |
| `status` | string | HTTP status name (OK, CREATED, BAD_REQUEST, etc.) |

---

## Error Handling

### Error Response Codes

| Code | Meaning | When |
|------|---------|------|
| `200 OK` | Success | Request completed successfully |
| `201 CREATED` | Created | Resource successfully created |
| `202 ACCEPTED` | Accepted | Request accepted but processing async |
| `400 BAD_REQUEST` | Invalid request | Validation errors, missing fields |
| `401 UNAUTHORIZED` | No auth | Missing or invalid JWT token |
| `403 FORBIDDEN` | Permission denied | User lacks required permissions |
| `404 NOT_FOUND` | Not found | Resource doesn't exist |
| `409 CONFLICT` | Conflict | Resource already exists (duplicate) |
| `500 INTERNAL_SERVER_ERROR` | Server error | Unexpected server error |

### Validation Errors

When validation fails, the response includes field-specific errors:

```json
{
  "message": "Bad Request",
  "data": {
    "username": "Username is required",
    "email": "Email must be valid",
    "password": "Password must be at least 8 characters"
  },
  "status": "BAD_REQUEST"
}
```

---

## Auth Service API

**Service Base URL**: `/app/v1/user/` and `/app/v1/public/`  
**Port**: 8081

### 1. User Registration

Register a new user and send OTP for verification.

**Endpoint**: `POST /user/create`  
**Authentication**: ❌ Not required  
**Rate Limit**: 5 requests per minute

#### Request

```bash
curl -X POST http://localhost:8080/app/v1/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `username` | string | ✅ | 3-20 chars, alphanumeric + underscore |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 8 chars, uppercase, lowercase, number, special |
| `firstName` | string | ❌ | Max 50 chars |
| `lastName` | string | ❌ | Max 50 chars |

#### Success Response (201 Created)

```json
{
  "message": "User Registered Successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false,
    "createdAt": "2026-04-19T10:30:00Z"
  },
  "status": "OK"
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Bad Request",
  "data": {
    "username": "Username already exists",
    "email": "Email already registered"
  },
  "status": "BAD_REQUEST"
}
```

#### Error Response (409 Conflict)

```json
{
  "message": "Resource already exists",
  "data": "User with username 'john_doe' already exists",
  "status": "CONFLICT"
}
```

---

### 2. Account Verification

Verify user account with OTP received via email.

**Endpoint**: `PATCH /user/verify`  
**Authentication**: ❌ Not required  
**Rate Limit**: 10 requests per minute

#### Request

```bash
curl -X PATCH http://localhost:8080/app/v1/user/verify \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "otp": "123456"
  }'
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | string | ✅ | Username to verify |
| `otp` | string | ✅ | 6-digit OTP |

#### Success Response (200 OK)

```json
{
  "message": "User verified successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "isVerified": true,
    "verifiedAt": "2026-04-19T10:35:00Z"
  },
  "status": "OK"
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Bad Request",
  "data": "Invalid OTP",
  "status": "BAD_REQUEST"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "User 'john_doe' not found",
  "status": "BAD_REQUEST"
}
```

---

### 3. Resend OTP

Send a new OTP to user's email.

**Endpoint**: `GET /user/resend-otp`  
**Authentication**: ❌ Not required  
**Rate Limit**: 3 requests per hour per user

#### Request

```bash
curl -X GET "http://localhost:8080/app/v1/user/resend-otp?username=john_doe"
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | ✅ | Username to resend OTP for |

#### Success Response (200 OK)

```json
{
  "message": "OTP sent successfully",
  "data": "OTP sent to registered email",
  "status": "OK"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "User not found",
  "status": "BAD_REQUEST"
}
```

---

### 4. User Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /public/login`  
**Authentication**: ❌ Not required  
**Rate Limit**: 10 requests per minute

#### Request

```bash
curl -X POST http://localhost:8080/app/v1/public/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| `username` | string | ✅ |
| `password` | string | ✅ |

#### Success Response (200 OK)

```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ1c2VybmFtZSI6ImpvaG5fZG9lIiwiaWF0IjoxNjEzNjI0MDAwLCJleHAiOjE2MTM3MTA0MDB9.signature",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "expiresIn": 86400000,
    "isVerified": true
  },
  "status": "OK"
}
```

#### Error Response (401 Unauthorized)

```json
{
  "message": "Invalid credentials",
  "data": "Username or password is incorrect",
  "status": "UNAUTHORIZED"
}
```

#### Error Response (403 Account Not Verified)

```json
{
  "message": "Account not verified",
  "data": "Please verify your email before logging in",
  "status": "FORBIDDEN"
}
```

---

### 5. Server-Sent Events (SSE) Subscription

Subscribe to real-time events for a device.

**Endpoint**: `GET /sse/subscribe/{deviceId}`  
**Authentication**: ✅ Required  
**Response Type**: `text/event-stream`
**Protocol**: Server-Sent Events

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/sse/subscribe/device-12345 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `deviceId` | string | Unique device identifier |

#### Response (Event Stream)

```
data: {"type":"mail_received","from":"sender@example.com","subject":"Hello"}
data: {"type":"user_login","device":"mobile"}
data: {"type":"setting_updated","key":"theme","value":"dark"}
```

#### Event Types

| Type | Payload | When |
|------|---------|------|
| `mail_received` | Email details | New email arrives |
| `user_login` | Login info | User logs in |
| `user_logout` | Logout info | User logs out |
| `setting_updated` | Setting key/value | Settings changed |

---

## User Service API

**Service Base URL**: `/app/v1/users/`  
**Port**: 8082

### 1. Get User by Username

Retrieve user information by username.

**Endpoint**: `GET /users/username/{username}`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/users/username/john_doe \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | Username to search for |

#### Success Response (200 OK)

```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2026-04-10T08:00:00Z",
    "updatedAt": "2026-04-19T10:00:00Z"
  },
  "status": "OK"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "User 'john_doe' not found",
  "status": "BAD_REQUEST"
}
```

---

### 2. Get User by ID

Retrieve user information by userId.

**Endpoint**: `GET /users/{userId}`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID/string | User ID to retrieve |

#### Success Response (200 OK)

```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "isActive": true
  },
  "status": "OK"
}
```

---

### 3. Get User Mail Configuration

Retrieve email configuration settings for a user.

**Endpoint**: `GET /users/{userId}/config`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/users/550e8400-e29b-41d4-a716-446655440000/config \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | User ID |

#### Success Response (200 OK)

```json
{
  "message": "Mail config retrieved successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "mailAddress": "john.doe@mailforge.com",
    "smtpServer": "smtp.mailforge.com",
    "smtpPort": 587,
    "imapServer": "imap.mailforge.com",
    "imapPort": 993,
    "autoArchive": false,
    "autoReply": false,
    "autoReplyMessage": null,
    "encryptionEnabled": true,
    "signatureEnabled": true,
    "signature": "Best regards,\nJohn Doe",
    "maxMailSize": 25000000,
    "createdAt": "2026-04-10T08:00:00Z",
    "updatedAt": "2026-04-19T10:00:00Z"
  },
  "status": "OK"
}
```

---

### 4. Update User Mail Configuration

Update email settings for a user.

**Endpoint**: `PUT /users/{userId}/config`  
**Authentication**: ✅ Required (Must be own user or admin)  
**Rate Limit**: 50 requests per minute

#### Request

```bash
curl -X PUT http://localhost:8080/app/v1/users/550e8400-e29b-41d4-a716-446655440000/config \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "autoArchive": true,
    "autoReply": true,
    "autoReplyMessage": "I am out of office. Will respond when back.",
    "encryptionEnabled": true,
    "signatureEnabled": true,
    "signature": "Updated signature"
  }'
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | User ID to update |

#### Request Body (All Optional)

| Field | Type | Constraints |
|-------|------|-------------|
| `autoArchive` | boolean | - |
| `autoReply` | boolean | - |
| `autoReplyMessage` | string | Max 1000 chars |
| `encryptionEnabled` | boolean | - |
| `signatureEnabled` | boolean | - |
| `signature` | string | Max 500 chars |

#### Success Response (200 OK)

```json
{
  "message": "Mail config updated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "autoArchive": true,
    "autoReply": true,
    "autoReplyMessage": "I am out of office. Will respond when back.",
    "encryptionEnabled": true,
    "signatureEnabled": true,
    "signature": "Updated signature"
  },
  "status": "OK"
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Bad Request",
  "data": {
    "signature": "Signature cannot exceed 500 characters",
    "autoReplyMessage": "Auto reply message cannot exceed 1000 characters"
  },
  "status": "BAD_REQUEST"
}
```

---

### 5. Deactivate User

Deactivate (soft delete) a user account.

**Endpoint**: `DELETE /users/{userId}`  
**Authentication**: ✅ Required (Must be own user or admin)  
**Rate Limit**: 10 requests per minute

#### Request

```bash
curl -X DELETE http://localhost:8080/app/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID/string | User to deactivate |

#### Success Response (200 OK)

```json
{
  "message": "User deactivated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "isActive": false,
    "deactivatedAt": "2026-04-19T14:30:00Z"
  },
  "status": "OK"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "User not found",
  "status": "BAD_REQUEST"
}
```

---

## Mail Service API

**Service Base URL**: `/app/v1/mail/`  
**Port**: 8083

### 1. Ingest Raw Email

Ingest a raw email message for processing and storage.

**Endpoint**: `POST /mail/ingest`  
**Authentication**: ✅ Required (Internal service or admin)  
**Content-Type**: `application/octet-stream`  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X POST http://localhost:8080/app/v1/mail/ingest \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @email.eml
```

#### Request Body

Raw email file in RFC 2822 format (`.eml` file)

#### Success Response (202 Accepted)

```json
{
  "message": "Email ingested successfully",
  "data": "",
  "status": "ACCEPTED"
}
```

**Note**: Processing happens asynchronously. Email will be available in inbox after processing.

#### Error Response (400 Bad Request)

```json
{
  "message": "Bad Request",
  "data": "Invalid email format",
  "status": "BAD_REQUEST"
}
```

---

### 2. Get User Inbox

Retrieve all incoming emails for a user.

**Endpoint**: `GET /mail/inbox/{userId}`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/mail/inbox/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | User ID |

#### Query Parameters

| Parameter | Type | Optional | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ✅ | 0 | Page number (0-indexed) |
| `size` | integer | ✅ | 20 | Items per page |
| `sort` | string | ✅ | receivedAt,desc | Sort field and order |

#### Success Response (200 OK)

```json
{
  "message": "Inbox retrieved successfully",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "fromAddress": "sender@example.com",
      "toAddress": "john@mailforge.com",
      "subject": "Project Update",
      "receivedAt": "2026-04-19T12:30:00Z",
      "isRead": false,
      "hash": "2c26b46911185131006633f5b5a4e8fcb9ca32fa8d6d83e4a926a3e4f23f8f10"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "fromAddress": "notifications@service.com",
      "toAddress": "john@mailforge.com",
      "subject": "Action Required",
      "receivedAt": "2026-04-19T10:15:00Z",
      "isRead": true,
      "hash": "3c36d47921195232116743g6c6b5f9fdcacb33gb9e7e94f5a937b4f5g34g9g21"
    }
  ],
  "status": "OK"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "User not found",
  "status": "BAD_REQUEST"
}
```

---

### 3. Get User Sent Items

Retrieve all outgoing (sent) emails from a user.

**Endpoint**: `GET /mail/sent/{userId}`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/mail/sent/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | User ID |

#### Success Response (200 OK)

```json
{
  "message": "Sent emails retrieved successfully",
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "fromAddress": "john@mailforge.com",
      "toAddress": "recipient@example.com",
      "subject": "Meeting Scheduled",
      "receivedAt": "2026-04-19T09:00:00Z",
      "isRead": true,
      "hash": "4d47e55a32206343227854h7d7c6g0eddcbca43hc0f8f05g6b038c5g45g0g32"
    }
  ],
  "status": "OK"
}
```

---

### 4. Get Specific Email

Retrieve a single email by ID.

**Endpoint**: `GET /mail/{id}`  
**Authentication**: ✅ Required  
**Rate Limit**: 200 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/mail/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Email ID |

#### Success Response (200 OK)

```json
{
  "message": "Mail retrieved successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "fromAddress": "sender@example.com",
    "toAddress": "john@mailforge.com",
    "subject": "Project Update",
    "receivedAt": "2026-04-19T12:30:00Z",
    "isRead": false,
    "hash": "2c26b46911185131006633f5b5a4e8fcb9ca32fa8d6d83e4a926a3e4f23f8f10"
  },
  "status": "OK"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "Mail not found with id: 660e8400-e29b-41d4-a716-446655440001",
  "status": "BAD_REQUEST"
}
```

---

### 5. Delete Email

Delete (soft delete) an email.

**Endpoint**: `DELETE /mail/{id}`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X DELETE http://localhost:8080/app/v1/mail/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Email ID to delete |

#### Success Response (200 OK)

```json
{
  "message": "Mail deleted successfully",
  "data": "",
  "status": "OK"
}
```

---

### 6. Send Email

Send a new email message.

**Endpoint**: `POST /mail/send`  
**Authentication**: ✅ Required  
**Rate Limit**: 50 requests per minute

#### Request

```bash
curl -X POST http://localhost:8080/app/v1/mail/send \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fromAddress": "john@mailforge.com",
    "toAddress": "recipient@example.com",
    "subject": "Hello",
    "body": "This is the email body",
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"],
    "isHTML": false,
    "attachments": []
  }'
```

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `fromAddress` | string | ✅ | Valid email |
| `toAddress` | string | ✅ | Valid email(s), comma-separated for multiple |
| `subject` | string | ✅ | Max 200 chars |
| `body` | string | ✅ | Max 1,000,000 chars |
| `cc` | array | ❌ | Valid emails |
| `bcc` | array | ❌ | Valid emails |
| `isHTML` | boolean | ❌ | Default: false |
| `attachments` | array | ❌ | Base64 encoded files |

#### Success Response (201 Created)

```json
{
  "message": "Email sent successfully",
  "data": "",
  "status": "CREATED"
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Bad Request",
  "data": {
    "toAddress": "Invalid email address",
    "subject": "Subject cannot exceed 200 characters",
    "body": "Body cannot exceed 1,000,000 characters"
  },
  "status": "BAD_REQUEST"
}
```

---

### 7. Verify Email Integrity

Verify if email has been tampered with using hash verification.

**Endpoint**: `GET /mail/{id}/verify`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X GET http://localhost:8080/app/v1/mail/660e8400-e29b-41d4-a716-446655440001/verify \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Email ID to verify |

#### Success Response (200 OK)

```json
{
  "message": "Mail verification completed",
  "data": {
    "mailId": "660e8400-e29b-41d4-a716-446655440001",
    "status": "VALID",
    "storedHash": "2c26b46911185131006633f5b5a4e8fcb9ca32fa8d6d83e4a926a3e4f23f8f10",
    "computedHash": "2c26b46911185131006633f5b5a4e8fcb9ca32fa8d6d83e4a926a3e4f23f8f10"
  },
  "status": "OK"
}
```

**Status Values**:
- `VALID` - Email hash matches, not tampered
- `TAMPERED` - Email hash mismatch, content modified
- `ERROR` - Unable to verify email

#### Error Response (404 Not Found)

```json
{
  "message": "Resource not found",
  "data": "Mail not found with id: 660e8400-e29b-41d4-a716-446655440001",
  "status": "BAD_REQUEST"
}
```

---

### 8. Mark Email as Read

Mark an email as read.

**Endpoint**: `PATCH /mail/{id}/read`  
**Authentication**: ✅ Required  
**Rate Limit**: 100 requests per minute

#### Request

```bash
curl -X PATCH http://localhost:8080/app/v1/mail/660e8400-e29b-41d4-a716-446655440001/read \
  -H "Authorization: Bearer <jwt-token>"
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Email ID to mark as read |

#### Success Response (200 OK)

```json
{
  "message": "Mail marked as read",
  "data": "",
  "status": "OK"
}
```

---

## Status Codes

### HTTP Status Codes Used

| Code | Status | Usage |
|------|--------|-------|
| `200` | OK | Successful GET, PUT, PATCH, DELETE |
| `201` | Created | Successful POST (resource created) |
| `202` | Accepted | Request accepted, processing async |
| `400` | Bad Request | Validation failed, missing required fields |
| `401` | Unauthorized | Missing JWT token or invalid token |
| `403` | Forbidden | User lacks required permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists (duplicate user, etc.) |
| `500` | Internal Server Error | Unexpected server error |

---

## Rate Limiting

API implements rate limiting to prevent abuse:

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1618901234
```

### Rate Limit Strategies

- **Authentication endpoints**: 5-10 requests per minute per IP
- **User endpoints**: 100 requests per minute per token
- **Mail operations**: 50-100 requests per minute per token
- **Read operations**: 200 requests per minute per token

### Rate Limit Response (429)

```json
{
  "message": "Too Many Requests",
  "data": "Rate limit exceeded. Try again after 60 seconds",
  "status": "TOO_MANY_REQUESTS"
}
```

---

## API Gateway Routes

The API Gateway (port 8080) routes requests to appropriate microservices:

### Route Configuration

| Path | Service | Port | Auth Required |
|------|---------|------|---------------|
| `/app/v1/user/create` | Auth Service | 8081 | ❌ |
| `/app/v1/user/verify` | Auth Service | 8081 | ❌ |
| `/app/v1/user/resend-otp` | Auth Service | 8081 | ❌ |
| `/app/v1/public/login` | Auth Service | 8081 | ❌ |
| `/app/v1/sse/*` | Auth Service | 8081 | ✅ |
| `/app/v1/users/*` | User Service | 8082 | ✅ |
| `/app/v1/mail/*` | Mail Service | 8083 | ✅ |
| `/actuator/*` | All Services | - | ❌ |

### Health Check Endpoints

```bash
# API Gateway Health
curl http://localhost:8080/actuator/health

# Auth Service Health
curl http://localhost:8081/actuator/health

# User Service Health
curl http://localhost:8082/actuator/health

# Mail Service Health
curl http://localhost:8083/actuator/health

# Service Discovery (Eureka)
curl http://localhost:8761/eureka
```

---

## CORS Configuration

### Allowed Origins

- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

### Allowed Methods

- GET, POST, PUT, DELETE, PATCH, OPTIONS

### Allowed Headers

All headers are allowed (`*`), including:
- `Authorization`
- `Content-Type`
- Custom headers

### Credentials

CORS credentials (cookies, auth headers) are allowed.

---

## Webhook Events (Future)

Webhooks for real-time notifications will support these events:

- `user.registered` - New user registration
- `user.verified` - User verification complete
- `mail.received` - New email received
- `mail.sent` - Email successfully sent
- `mail.failed` - Email sending failed
- `user.settings.updated` - User settings changed

---

## Pagination

For endpoints returning lists, use pagination:

```bash
curl "http://localhost:8080/app/v1/mail/inbox/550e8400-e29b-41d4-a716-446655440000?page=0&size=20&sort=receivedAt,desc"
```

### Pagination Parameters

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| `page` | integer | 0 | N/A |
| `size` | integer | 20 | 100 |
| `sort` | string | id,asc | Multiple fields allowed |

### Pagination Response

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalPages": 5,
    "totalElements": 100
  }
}
```

---

## API Versioning

Current API version is **v1** as shown in all endpoints (`/app/v1/`).

Future versions will be available at `/app/v2/`, `/app/v3/`, etc.

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** in httpOnly cookies or secure storage
3. **Never expose tokens** in URLs or logs
4. **Set short expiration** times (default: 24 hours)
5. **Validate all inputs** on client side
6. **Use CORS carefully** - restrict to known origins only
7. **Implement rate limiting** to prevent brute force attacks
8. **Log security events** for audit trails

---

## Troubleshooting

### Common Issues

#### 401 Unauthorized
- Token is missing or invalid
- Token has expired (24 hours)
- User account has been deactivated

**Solution**: 
```bash
# Re-login to get new token
curl -X POST http://localhost:8080/app/v1/public/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

#### 403 Forbidden
- User lacks required permissions
- Trying to access another user's data

**Solution**: Ensure you have proper permissions for the resource

#### 404 Not Found
- Resource doesn't exist
- Wrong endpoint path
- Typo in ID

**Solution**: Verify resource exists before accessing

#### 429 Too Many Requests
- Rate limit exceeded
- Making too many requests too quickly

**Solution**: Wait before making new requests

---

## Support & Contact

For API issues, documentation, or feature requests:

- **GitHub**: https://github.com/Akshat-Rastogi-007/MailForge
- **Documentation**: See individual service READMEs
- **Issues**: https://github.com/Akshat-Rastogi-007/MailForge/issues

---

## Change Log

### v1.0.0 (April 19, 2026)

✅ Initial API release with:
- User authentication and registration
- Email management (send, receive, verify)
- User profile and settings management
- Real-time notifications via SSE
- Complete error handling

**Next**: v1.1.0 - Webhook support, advanced search, attachment handling

---

**Document Version**: 1.0.0  
**Last Updated**: April 19, 2026  
**Maintained by**: MailForge Development Team
