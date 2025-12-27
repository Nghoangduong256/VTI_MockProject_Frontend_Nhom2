// Test API Login với Postman hoặc curl

// ===== POSTMAN TEST =====
/*
Method: POST
URL: http://localhost:8080/api/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "username": "your_username",
  "password": "your_password"
}

Expected Response (Success):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 3600
}

Expected Response (Fail):
{
  "message": "Invalid credentials"
}
*/

// ===== CURL TEST =====
/*
# Test login với curl
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# Test với protected endpoint (thay <TOKEN> bằng token thật)
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer <TOKEN>"
*/

// ===== JAVASCRIPT TEST (Browser Console) =====
/*
// Test API từ browser console
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  // Lưu token
  localStorage.setItem('token', data.token);
})
.catch((error) => {
  console.error('Error:', error);
});

// Test với token đã lưu
fetch('http://localhost:8080/api/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  }
})
.then(response => response.json())
.then(data => console.log('Protected data:', data))
.catch((error) => console.error('Error:', error));
*/

// ===== AXIOS TEST (Node.js) =====
/*
const axios = require('axios');

// Test login
async function testLogin() {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'your_username',
      password: 'your_password'
    });
    
    console.log('Login Success:');
    console.log('Token:', response.data.token);
    console.log('Type:', response.data.type);
    console.log('Expires In:', response.data.expiresIn);
    
    return response.data.token;
  } catch (error) {
    console.error('Login Failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}

// Test protected endpoint
async function testProtectedEndpoint(token) {
  try {
    const response = await axios.get('http://localhost:8080/api/protected-endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Protected Data:', response.data);
  } catch (error) {
    console.error('Access Denied:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}

// Run tests
(async () => {
  const token = await testLogin();
  if (token) {
    await testProtectedEndpoint(token);
  }
})();
*/

// ===== CHECKLIST TRƯỚC KHI TEST =====
/*
☑️ Backend API đang chạy trên http://localhost:8080
☑️ Endpoint /api/auth/login đã được implement
☑️ CORS đã được enable cho frontend origin
☑️ Database đã có user test
☑️ JWT secret đã được cấu hình trong backend
*/

// ===== COMMON ERRORS & SOLUTIONS =====
/*
1. ERR_CONNECTION_REFUSED
   → Backend chưa chạy hoặc sai port
   → Solution: Start backend server

2. CORS Error
   → Backend chưa enable CORS
   → Solution: Thêm CORS config trong backend

3. 401 Unauthorized
   → Username/password sai
   → Token hết hạn hoặc invalid
   → Solution: Check credentials, refresh token

4. 404 Not Found
   → Endpoint chưa tồn tại
   → Solution: Check backend routes

5. Network Error
   → Không có internet
   → Firewall block
   → Solution: Check network connection
*/

export { };
