# Instructor Dashboard

A modern, responsive instructor dashboard for the Learning Management System (LMS) built with Angular 17 and Tailwind CSS.

## Features

### 📊 Dashboard Overview
- **Real-time Analytics**: View total courses, students, revenue, and ratings
- **Course Selection**: Choose specific courses to analyze
- **Time Period Filtering**: Filter data by week, month, or year
- **Interactive Charts**: Visual representation of student progress and engagement

### 👥 Student Management
- **Student Progress Tracking**: Monitor individual student progress
- **Progress Visualization**: Color-coded progress bars and completion rates
- **Last Activity Tracking**: See when students were last active
- **Lesson Completion Stats**: Track completed vs total lessons

### 📚 Course Management
- **Course Creation**: Create new courses with detailed information
- **Course Editing**: Update course details, objectives, and prerequisites
- **Publish/Unpublish**: Control course visibility
- **Course Deletion**: Remove courses with confirmation

### 📈 Analytics & Insights
- **Module Progress**: Track completion rates for each module
- **Course Engagement**: Monitor student activity and time spent
- **Completion Rates**: View overall course completion statistics
- **Revenue Tracking**: Monitor course earnings

## Getting Started

### Prerequisites
- Angular 17+
- Node.js 18+
- Backend API running on `http://localhost:3000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

### Authentication

To access the instructor dashboard, you need to be logged in as an instructor. The system supports:

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Instructor-specific features and permissions
- **Automatic Token Management**: Tokens are automatically included in API requests

### API Endpoints

The dashboard consumes the following backend endpoints:

#### Analytics
- `GET /analytics/dashboard/stats` - Overall platform statistics
- `GET /analytics/instructor/{id}` - Instructor-specific statistics
- `GET /analytics/course/{id}/completion-rate` - Course completion rates
- `GET /analytics/course/{id}/engagement` - Course engagement data
- `GET /analytics/course/{id}/module-progress` - Module progress breakdown

#### Course Management
- `GET /courses` - Get instructor's courses
- `POST /courses` - Create new course
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course

#### Student Management
- `GET /enrollments/course/{id}` - Get course enrollments
- `GET /analytics/student/{id}` - Student progress analytics

## Usage

### Accessing the Dashboard

1. Navigate to the instructor dashboard: `/instructor/dashboard`
2. Or access course management: `/instructor/courses`

### Creating a Course

1. Click "Create Course" button
2. Fill in the required information:
   - Course title
   - Description
   - Learning objectives (one per line)
   - Prerequisites (optional)
   - Level (Beginner/Intermediate/Advanced)
   - Category
   - Publication status
3. Click "Create Course"

### Managing Students

1. Select a course from the dropdown
2. Navigate to the "Students" tab
3. View student progress, completion rates, and last activity
4. Monitor individual student performance

### Viewing Analytics

1. Select a course and time period
2. Navigate between tabs:
   - **Overview**: Course summary and quick stats
   - **Students**: Student progress and performance
   - **Modules**: Module-wise progress breakdown
   - **Engagement**: Student activity and time spent

## Design Features

### Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme Support**: Clean, modern interface
- **Interactive Elements**: Hover effects, animations, and transitions
- **Accessibility**: WCAG compliant design

### Visual Elements
- **Progress Bars**: Color-coded progress indicators
- **Status Badges**: Visual status indicators for courses and students
- **Icons**: Intuitive iconography throughout the interface
- **Charts**: Data visualization for analytics

### Performance
- **Lazy Loading**: Components load on demand
- **Optimized API Calls**: Efficient data fetching
- **Caching**: Local storage for user preferences
- **Error Handling**: Graceful error states and loading indicators

## Customization

### Styling
The dashboard uses Tailwind CSS for styling. You can customize:

- Colors: Modify the color scheme in `tailwind.config.js`
- Components: Update component styles in individual `.css` files
- Layout: Adjust responsive breakpoints and grid layouts

### Adding Features
To add new features:

1. Create new components in `src/app/pages/`
2. Add routes in `src/app/app.routes.ts`
3. Update the instructor service for new API endpoints
4. Add navigation links in the header component

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure you're logged in as an instructor
2. **API Connection**: Verify the backend is running on port 3000
3. **CORS Issues**: Check backend CORS configuration
4. **Data Not Loading**: Check browser console for API errors

### Debug Mode
Enable debug mode by setting `localStorage.setItem('debug', 'true')` in the browser console.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 