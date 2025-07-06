// Simple test script to verify Cloudinary integration
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (you'll need to set these environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryUpload() {
  try {
    console.log('Testing Cloudinary upload from URL...');
    
    // Test uploading from a public URL
    const result = await cloudinary.uploader.upload(
      'https://picsum.photos/200/300', // A test image
      {
        folder: 'test',
        public_id: 'test_upload_' + Date.now()
      }
    );
    
    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Test deleting the uploaded file
    const deleteResult = await cloudinary.uploader.destroy(result.public_id);
    console.log('Delete successful:', deleteResult.result);
    
  } catch (error) {
    console.error('Error testing Cloudinary:', error.message);
  }
}

// Check if environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('Please set the following environment variables:');
  console.error('CLOUDINARY_CLOUD_NAME');
  console.error('CLOUDINARY_API_KEY');
  console.error('CLOUDINARY_API_SECRET');
  process.exit(1);
}

testCloudinaryUpload(); 