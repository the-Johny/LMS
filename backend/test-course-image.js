const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCourseImageUpload() {
  try {
    console.log('Testing course image upload...');
    
    // Create a test course
    const course = await prisma.course.create({
      data: {
        title: 'Test Course with Image',
        description: 'A test course to verify image upload functionality',
        objectives: ['Learn testing', 'Verify image upload'],
        prerequisites: ['Basic knowledge'],
        level: 'BEGINNER',
        category: 'PROGRAMMING',
        isPublished: false,
        instructorId: null
      }
    });
    
    console.log('Created test course:', course.id);
    
    // Test image URL (using a placeholder image)
    const testImageUrl = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Test+Course+Image';
    
    // Update course with image
    const updatedCourse = await prisma.course.update({
      where: { id: course.id },
      data: {
        imageUrl: testImageUrl,
        imagePublicId: `courses/course_${course.id}`
      }
    });
    
    console.log('Updated course with image:', {
      id: updatedCourse.id,
      title: updatedCourse.title,
      imageUrl: updatedCourse.imageUrl,
      imagePublicId: updatedCourse.imagePublicId
    });
    
    // Clean up - delete the test course
    await prisma.course.delete({
      where: { id: course.id }
    });
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourseImageUpload(); 