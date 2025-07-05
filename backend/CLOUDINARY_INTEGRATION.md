# Cloudinary Integration for LMS

This document explains how Cloudinary is integrated into the LMS for handling course content and certificates.

## Overview

The LMS now automatically processes course content URLs and certificate URLs through Cloudinary to ensure:
- Consistent storage and delivery
- Better performance and reliability
- Automatic optimization of media files
- Secure access control

## Features

### Automatic URL Processing

When creating or updating lessons and certificates, the system automatically:

1. **Checks if the URL is already a Cloudinary URL** - If yes, stores it as-is
2. **Uploads external URLs to Cloudinary** - If no, uploads the content and stores the Cloudinary URL
3. **Manages file lifecycle** - Automatically deletes old files when updating content

### Supported Content Types

- **Lessons**: Videos, documents, images, and other media files
- **Certificates**: PDF files and other document formats

## API Endpoints

### Direct Upload Endpoints

#### Upload Lesson Content
```http
POST /cloudinary/upload/lesson
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
lessonId: <lesson-id>
```

#### Upload Certificate
```http
POST /cloudinary/upload/certificate
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
certificateId: <certificate-id>
```

#### Upload from URL
```http
POST /cloudinary/upload/url
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/file.mp4",
  "folder": "lessons",
  "publicId": "optional-public-id"
}
```

### Automatic Processing

#### Create Lesson (Automatic Cloudinary Processing)
```http
POST /lessons
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Programming",
  "contentUrl": "https://example.com/video.mp4", // Will be uploaded to Cloudinary
  "type": "VIDEO",
  "order": 1,
  "moduleId": "module-id",
  "isVisible": true
}
```

#### Issue Certificate (Automatic Cloudinary Processing)
```http
POST /enrollments/certificates
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id",
  "courseId": "course-id",
  "certificateUrl": "https://example.com/certificate.pdf" // Will be uploaded to Cloudinary
}
```

## How It Works

### Lesson Creation Flow

1. **Create Lesson**: System creates lesson record in database
2. **Check URL**: If contentUrl is not a Cloudinary URL, upload to Cloudinary
3. **Update Record**: Update lesson with Cloudinary URL
4. **Return Response**: Return lesson with Cloudinary URL

### Certificate Issuance Flow

1. **Create Certificate**: System creates certificate record in database
2. **Check URL**: If certificateUrl is not a Cloudinary URL, upload to Cloudinary
3. **Update Record**: Update certificate with Cloudinary URL
4. **Return Response**: Return certificate with Cloudinary URL

### Update Flow

1. **Check New URL**: If new contentUrl is not a Cloudinary URL
2. **Delete Old File**: Remove old Cloudinary file if it exists
3. **Upload New File**: Upload new content to Cloudinary
4. **Update Record**: Update with new Cloudinary URL

### Delete Flow

1. **Delete Cloudinary File**: Remove file from Cloudinary if it exists
2. **Delete Database Record**: Remove record from database

## Configuration

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Folder Structure

- **Lessons**: `lessons/lesson_<lesson-id>`
- **Certificates**: `certificates/certificate_<certificate-id>`

## Error Handling

The system is designed to be resilient:

- **Upload Failures**: If Cloudinary upload fails, the original URL is stored
- **Delete Failures**: If Cloudinary deletion fails, the database operation continues
- **Network Issues**: Graceful fallback to original URLs

## Security

- **Authentication Required**: All upload endpoints require valid JWT tokens
- **Role-Based Access**: Only instructors and admins can upload content
- **File Validation**: Cloudinary automatically validates file types and sizes

## Benefits

1. **Performance**: Cloudinary provides optimized delivery and CDN
2. **Reliability**: Automatic backups and redundancy
3. **Scalability**: Handles large files and high traffic
4. **Cost-Effective**: Pay-as-you-go pricing model
5. **Security**: Secure URLs and access control

## Testing

Use the provided HTTP test files:
- `restclient/cloudinary.http` - Direct upload endpoints
- `restclient/instructor.http` - Automatic processing examples

## Migration Notes

- Existing lessons and certificates with external URLs will be processed when updated
- Cloudinary URLs are automatically detected and stored as-is
- No manual migration required for existing data 