const https = require('https');
const http = require('http');

// Test data
const testData = {
  title: "Introduction Module",
  courseId: "a277b02e-2603-4e32-9ee2-aba1eec45b53"
};

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZDViZWE2Yi1jNjY5LTQzZTgtYmViYi00NTA5NTA0MTMzMTMiLCJlbWFpbCI6ImtpbXV0YWlicmlhbjkyMkBnbWFpbC5jb20iLCJyb2xlIjoiSU5TVFJVQ1RPUiIsImlhdCI6MTc1MTc0MzA4MCwiZXhwIjoxNzUxODI5NDgwfQ.TC3kiFJTGtQJSG6Eu2hg1yAzmbIRFx7_NHJk9HlWwtQ";

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/modules',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${token}`
  }
};

console.log('Sending request with data:', postData);
console.log('Data length:', Buffer.byteLength(postData));

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end(); 