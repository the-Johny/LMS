const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZDViZWE2Yi1jNjY5LTQzZTgtYmViYi00NTA5NTA0MTMzMTMiLCJlbWFpbCI6ImtpbXV0YWlicmlhbjkyMkBnbWFpbC5jb20iLCJyb2xlIjoiSU5TVFJVQ1RPUiIsImlhdCI6MTc1MTc0MzA4MCwiZXhwIjoxNzUxODI5NDgwfQ.TC3kiFJTGtQJSG6Eu2hg1yAzmbIRFx7_NHJk9HlWwtQ";

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/courses',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const courses = JSON.parse(data);
      console.log('\nAvailable courses:');
      courses.forEach(course => {
        console.log(`- ID: ${course.id}, Title: ${course.title}, Instructor: ${course.instructorId}`);
      });
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end(); 