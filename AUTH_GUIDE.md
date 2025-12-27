# 🔐 Hướng Dẫn Sử Dụng Authentication với JWT

## 📋 Tổng Quan

Hệ thống authentication đã được tích hợp hoàn chỉnh với các tính năng:
- ✅ Login với JWT token
- ✅ Lưu trữ token an toàn trong localStorage
- ✅ Auto-refresh token trên mỗi request
- ✅ Protected routes
- ✅ Redirect tự động
- ✅ Error handling
- ✅ Loading states

## 🏗️ Cấu Trúc Dự Án

```
front-end/src/
├── services/
│   └── apiClient.js              # Axios client với interceptors
├── features/auth/
│   ├── services/
│   │   └── authService.js        # Login, logout, token management
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Route protection
│   └── pages/
│       ├── LoginPage.jsx         # Login UI
│       └── DashboardPage.jsx     # Protected dashboard
```

## 🔧 Cấu Hình API

### Backend API URL
File: `src/services/apiClient.js`
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

### Login Endpoint
**URL:** `POST http://localhost:8080/api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 3600
}
```

**Response Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

## 🚀 Cách Sử Dụng

### 1. Cài Đặt Dependencies
```bash
cd front-end
npm install
```

### 2. Chạy Backend API
Đảm bảo backend API đang chạy trên `http://localhost:8080`

### 3. Chạy Frontend
```bash
npm run dev
```

### 4. Test Login
1. Mở trình duyệt: `http://localhost:5173`
2. Nhập username và password
3. Click "Log In"
4. Nếu thành công → redirect tới `/dashboard`
5. Nếu thất bại → hiển thị error message

## 🔐 Quản Lý Token

### Lưu Token
Token được tự động lưu vào localStorage sau khi login thành công:
- `token`: JWT token string
- `tokenType`: "Bearer"
- `tokenExpiresAt`: Timestamp hết hạn

### Gửi Token Trong Request
Token tự động được thêm vào header của mỗi request:
```javascript
Authorization: Bearer <token>
```

### Xóa Token (Logout)
```javascript
import { useAuth } from './features/auth/context/AuthContext';

function MyComponent() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout(); // Xóa token và redirect về login
  };
}
```

## 🛡️ Protected Routes

### Sử dụng ProtectedRoute
Bọc component cần bảo vệ với `ProtectedRoute`:

```jsx
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import MyPage from './pages/MyPage';

<Route 
  path="/my-page" 
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  } 
/>
```

### Auto Redirect
- Nếu **chưa login** → redirect về `/login`
- Nếu **đã login** → hiển thị protected page

## 📱 Sử Dụng Auth Context

### Trong Component
```jsx
import { useAuth } from './features/auth/context/AuthContext';

function MyComponent() {
  const { user, loading, error, login, logout, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome {user?.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login({ username: 'user', password: 'pass' })}>
          Login
        </button>
      )}
    </div>
  );
}
```

## 🔄 Flow Hoàn Chỉnh

### 1. Login Flow
```
User nhập credentials
    ↓
Submit form
    ↓
Call authService.login()
    ↓
POST /api/auth/login
    ↓
Nhận JWT token
    ↓
Lưu token vào localStorage
    ↓
Update AuthContext state
    ↓
Redirect to /dashboard
```

### 2. Protected Route Flow
```
User truy cập /dashboard
    ↓
ProtectedRoute check isAuthenticated
    ↓
Có token? → Hiển thị dashboard
    ↓
Không có token? → Redirect to /login
```

### 3. Auto-Refresh Token
```
Mỗi API request
    ↓
Axios interceptor
    ↓
Lấy token từ localStorage
    ↓
Thêm header: Authorization: Bearer <token>
    ↓
Gửi request
    ↓
Nhận response
    ↓
Nếu 401 → Logout và redirect to /login
```

## ⚙️ Tùy Chỉnh

### 1. Thay Đổi API URL
File: `src/services/apiClient.js`
```javascript
const API_BASE_URL = 'https://your-api-domain.com';
```

### 2. Thay Đổi Token Expiration
File: `src/features/auth/services/authService.js`
```javascript
// Thêm logic kiểm tra expiration tùy chỉnh
```

### 3. Thêm User Profile Endpoint
Nếu backend có endpoint `/api/auth/me`, uncomment trong `authService.js`:
```javascript
getCurrentUser: async () => {
  const response = await apiClient.get('/api/auth/me');
  localStorage.setItem('user', JSON.stringify(response.data));
  return response.data;
}
```

## 🐛 Debugging

### Check Token trong Console
```javascript
console.log(localStorage.getItem('token'));
```

### Check Auth State
```javascript
import { useAuth } from './features/auth/context/AuthContext';

const { user, isAuthenticated } = useAuth();
console.log('User:', user);
console.log('Is Authenticated:', isAuthenticated);
```

### Network Request
Mở DevTools → Network → All → Xem request `/api/auth/login`
- Check request body
- Check response
- Check headers

## ⚠️ Lưu Ý Quan Trọng

1. **CORS**: Đảm bảo backend cho phép CORS từ `http://localhost:5173`
2. **Token Security**: Không log token ra console trong production
3. **HTTPS**: Sử dụng HTTPS trong production để bảo mật token
4. **Token Refresh**: Implement refresh token nếu cần session dài hạn
5. **Error Handling**: Xử lý tất cả trường hợp lỗi từ API

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra backend API đang chạy
2. Kiểm tra network requests trong DevTools
3. Kiểm tra console logs
4. Verify API response format match với code

## 🎉 Hoàn Thành!

Hệ thống authentication của bạn đã sẵn sàng! 🚀
