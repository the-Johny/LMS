# Analytics and Progress API Documentation

This document provides comprehensive documentation for the Analytics and Progress endpoints in the LMS backend.

## Table of Contents

1. [Analytics Endpoints](#analytics-endpoints)
2. [Progress Endpoints](#progress-endpoints)
3. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
4. [Usage Examples](#usage-examples)

## Analytics Endpoints

### 1. Student Progress Analytics

#### Get Student Progress
```http
GET /analytics/student/{userId}
```

Returns progress information for all courses a student is enrolled in.

**Response:**
```json
[
  {
    "courseId": "uuid",
    "courseTitle": "Course Name",
    "completedLessons": 5,
    "totalLessons": 10,
    "progressPercentage": 50
  }
]
```

#### Get Student Learning Path
```http
GET /analytics/student/{userId}/learning-path
```

Returns learning path analysis and course recommendations based on completed courses.

**Response:**
```json
{
  "userId": "uuid",
  "completedCourses": 3,
  "inProgressCourses": 2,
  "totalEnrollments": 5,
  "completedCategories": ["PROGRAMMING", "DESIGN"],
  "recommendedCourses": [
    {
      "id": "uuid",
      "title": "Advanced JavaScript",
      "category": "PROGRAMMING",
      "level": "ADVANCED",
      "enrollmentCount": 150,
      "reviewCount": 25
    }
  ]
}
```

### 2. Course Analytics

#### Get Course Completion Rate
```http
GET /analytics/course/{courseId}/completion-rate
```

Returns the completion rate for a specific course.

**Response:**
```json
{
  "courseId": "uuid",
  "courseTitle": "Course Name",
  "completionRate": 75
}
```

#### Get Course Engagement
```http
GET /analytics/course/{courseId}/engagement?period={period}
```

Returns engagement metrics for a course over a specified period.

**Parameters:**
- `period`: `week`, `month`, or `year` (default: `month`)

**Response:**
```json
{
  "courseId": "uuid",
  "period": "month",
  "enrollments": 25,
  "completions": 150,
  "reviews": 12,
  "engagementScore": 85
}
```

#### Get Module Progress
```http
GET /analytics/course/{courseId}/module-progress
```

Returns module-wise progress breakdown for a course.

**Response:**
```json
[
  {
    "moduleId": "uuid",
    "moduleTitle": "Module 1",
    "totalLessons": 5,
    "totalEnrollments": 30,
    "completedLessons": 120,
    "completionRate": 80
  }
]
```

### 3. Platform Analytics

#### Get Dashboard Statistics
```http
GET /analytics/dashboard/stats
```

Returns overall platform statistics for the dashboard.

**Response:**
```json
{
  "totalUsers": 1000,
  "totalCourses": 50,
  "totalEnrollments": 2500,
  "totalCertificates": 800,
  "recentEnrollments": 45,
  "topCourses": [
    {
      "id": "uuid",
      "title": "Popular Course",
      "enrollmentCount": 200
    }
  ]
}
```

#### Get Popular Courses
```http
GET /analytics/popular-courses?limit={limit}
```

Returns the most popular courses by enrollment count.

**Parameters:**
- `limit`: Number of courses to return (default: 5)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Course Name",
    "enrollmentCount": 150
  }
]
```

### 4. Instructor Analytics

#### Get Instructor Statistics
```http
GET /analytics/instructor/{instructorId}
```

Returns statistics for all courses by a specific instructor.

**Response:**
```json
[
  {
    "courseId": "uuid",
    "title": "Course Name",
    "students": 100,
    "reviews": 25,
    "averageRating": 4.5
  }
]
```

### 5. Time and Certificate Analytics

#### Get Time Spent Analytics
```http
GET /analytics/time-spent/{userId}?courseId={courseId}
```

Returns estimated time spent analytics for a user.

**Response:**
```json
{
  "userId": "uuid",
  "courseId": "uuid",
  "analytics": [
    {
      "courseId": "uuid",
      "courseTitle": "Course Name",
      "totalLessons": 10,
      "completedLessons": 7,
      "estimatedTimeSpent": 210
    }
  ],
  "totalEstimatedTime": 210
}
```

#### Get Certificate Statistics
```http
GET /analytics/certificate-stats?instructorId={instructorId}
```

Returns certificate issuance statistics.

**Response:**
```json
{
  "totalCertificates": 500,
  "recentCertificates": 25,
  "certificatesByMonth": [
    {
      "month": "2024-01",
      "count": 45
    }
  ]
}
```

## Progress Endpoints

### 1. Progress Management

#### Mark Lesson Complete
```http
POST /progress/mark-complete
Content-Type: application/json

{
  "enrollmentId": "uuid",
  "lessonId": "uuid"
}
```

Marks a specific lesson as completed for an enrollment.

#### Mark Lesson Incomplete
```http
POST /progress/mark-incomplete
Content-Type: application/json

{
  "enrollmentId": "uuid",
  "lessonId": "uuid"
}
```

Marks a specific lesson as incomplete for an enrollment.

#### Bulk Mark Complete
```http
POST /progress/bulk-mark-complete
Content-Type: application/json

{
  "lessons": [
    {
      "enrollmentId": "uuid",
      "lessonId": "uuid"
    }
  ]
}
```

Marks multiple lessons as completed in a single request.

**Response:**
```json
[
  {
    "enrollmentId": "uuid",
    "lessonId": "uuid",
    "success": true
  }
]
```

### 2. Progress Retrieval

#### Get User Course Progress
```http
GET /progress/{enrollmentId}
```

Returns progress information for a specific enrollment.

**Response:**
```json
{
  "courseId": "uuid",
  "completedLessons": 5,
  "totalLessons": 10,
  "progressPercentage": 50
}
```

#### Get All Course Progress for User
```http
GET /progress/user/{userId}/courses
```

Returns progress for all courses a user is enrolled in.

**Response:**
```json
[
  {
    "enrollmentId": "uuid",
    "courseId": "uuid",
    "courseTitle": "Course Name",
    "enrolledAt": "2024-01-01T00:00:00Z",
    "completedLessons": 5,
    "totalLessons": 10,
    "progressPercentage": 50
  }
]
```

#### Get Course Progress Overview
```http
GET /progress/course/{courseId}/overview
```

Returns comprehensive progress overview for a course.

**Response:**
```json
{
  "courseId": "uuid",
  "courseTitle": "Course Name",
  "totalLessons": 20,
  "totalEnrollments": 50,
  "averageProgress": 65,
  "enrollmentStats": [
    {
      "enrollmentId": "uuid",
      "userId": "uuid",
      "completedLessons": 15,
      "totalLessons": 20,
      "progressPercentage": 75
    }
  ]
}
```

### 3. Detailed Progress Analytics

#### Get Module Progress
```http
GET /progress/module/{moduleId}/progress?enrollmentId={enrollmentId}
```

Returns detailed progress for a specific module.

**Response:**
```json
{
  "moduleId": "uuid",
  "moduleTitle": "Module Name",
  "totalLessons": 5,
  "totalEnrollments": 30,
  "moduleStats": [
    {
      "enrollmentId": "uuid",
      "userId": "uuid",
      "completedLessons": 4,
      "totalLessons": 5,
      "progressPercentage": 80
    }
  ]
}
```

#### Get Lesson Completions
```http
GET /progress/lesson/{lessonId}/completions?courseId={courseId}
```

Returns completion statistics for a specific lesson.

**Response:**
```json
{
  "lessonId": "uuid",
  "lessonTitle": "Lesson Name",
  "completions": 25,
  "totalEnrollments": 30,
  "completionRate": 83
}
```

### 4. Progress History and Management

#### Get Progress History
```http
GET /progress/history/{enrollmentId}?limit={limit}
```

Returns progress history for an enrollment.

**Parameters:**
- `limit`: Number of history entries to return (default: 10)

**Response:**
```json
[
  {
    "lessonId": "uuid",
    "lessonTitle": "Lesson Name",
    "moduleTitle": "Module Name",
    "courseTitle": "Course Name",
    "completed": true
  }
]
```

#### Reset Progress
```http
PUT /progress/reset/{enrollmentId}
```

Resets all progress for an enrollment.

**Response:**
```json
{
  "message": "Progress reset successfully"
}
```

#### Remove Lesson Progress
```http
DELETE /progress/lesson/{enrollmentId}/{lessonId}
```

Removes progress for a specific lesson.

**Response:**
```json
{
  "message": "Lesson progress removed successfully"
}
```

### 5. Student Progress Analytics

#### Get Student Progress Analytics
```http
GET /progress/analytics/student/{userId}?period={period}
```

Returns comprehensive progress analytics for a student.

**Parameters:**
- `period`: `week`, `month`, or `year` (default: `month`)

**Response:**
```json
{
  "userId": "uuid",
  "period": "month",
  "totalEnrollments": 5,
  "totalLessonsCompleted": 25,
  "coursesByCategory": {
    "PROGRAMMING": 3,
    "DESIGN": 2
  },
  "averageLessonsPerCourse": 5
}
```

## Data Transfer Objects (DTOs)

### Analytics DTOs

- `StudentProgressDto`: Student progress information
- `CourseCompletionRateDto`: Course completion rate data
- `PopularCourseDto`: Popular course information
- `InstructorCourseStatsDto`: Instructor course statistics
- `DashboardStatsDto`: Dashboard statistics
- `CourseEngagementDto`: Course engagement analytics
- `LearningPathDto`: Student learning path data

### Progress DTOs

- `MarkCompleteDto`: Lesson completion data
- `BulkMarkCompleteDto`: Bulk lesson completion data
- `UserProgressDto`: User progress information
- `CourseProgressOverviewDto`: Course progress overview

## Usage Examples

### Frontend Integration

```typescript
// Get student progress
const studentProgress = await fetch('/analytics/student/user123');
const progress = await studentProgress.json();

// Mark lesson complete
await fetch('/progress/mark-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enrollmentId: 'enrollment123',
    lessonId: 'lesson456'
  })
});

// Get dashboard stats
const dashboardStats = await fetch('/analytics/dashboard/stats');
const stats = await dashboardStats.json();
```

### Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

### Authentication

All endpoints require proper authentication. Include the appropriate authorization headers in your requests.

### Rate Limiting

Consider implementing rate limiting for production use to prevent abuse of the analytics endpoints.

## Notes

1. **Time Estimates**: Time spent analytics are estimated based on lesson completions (30 minutes per lesson).
2. **Progress Tracking**: Progress is tracked at the lesson level and aggregated up to modules and courses.
3. **Performance**: For large datasets, consider implementing pagination and caching strategies.
4. **Data Consistency**: Progress data is maintained through the `Progress` model with unique constraints on enrollment and lesson combinations. 