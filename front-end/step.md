# Hướng dẫn thêm Trang mới và Tính năng mới

## 📁 Cấu trúc thư mục Project

```
react-auth-app/
├── src/
│   ├── app/              # App core (routes, App.jsx)
│   ├── features/         # Features theo domain (auth, wallet, etc.)
│   ├── components/       # Shared components
│   ├── services/         # API calls, utilities
│   ├── styles/           # Global styles
│   ├── main.jsx          # Entry point
│   └── index.css         # Global CSS
├── public/               # Static assets
└── index.html            # HTML template
```

---

## 🆕 Thêm Trang Mới (New Page)

### Bước 1: Tạo Component Page

Tạo file page mới trong `src/features/[feature-name]/pages/`

**Ví dụ:** Tạo trang Dashboard

```bash
# Tạo thư mục (nếu chưa có)
mkdir src/features/dashboard
mkdir src/features/dashboard/pages
```

Tạo file `src/features/dashboard/pages/DashboardPage.jsx`:

```jsx
export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background-light">
            <h1>Dashboard</h1>
            {/* Nội dung trang của bạn */}
        </div>
    );
}
```

### Bước 2: Thêm Route

Mở file `src/app/routes.jsx` và thêm route mới:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage"; // Import page mới

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} /> {/* Route mới */}
        </Routes>
    );
}

export default AppRoutes;
```

### Bước 3: Test

```bash
# Chạy dev server (nếu chưa chạy)
npm run dev

# Truy cập trang mới tại:
# http://localhost:5173/dashboard
```

---

## 🎨 Thêm Component Mới (Reusable Component)

### Bước 1: Quyết định vị trí

- **Shared component** (dùng chung): → `src/components/`
- **Feature-specific component**: → `src/features/[feature-name]/components/`

### Bước 2: Tạo Component

**Ví dụ:** Tạo Button component

Tạo file `src/components/Button.jsx`:

```jsx
export default function Button({ children, variant = "primary", onClick, ...props }) {
    const baseClasses = "h-12 rounded-full font-bold shadow-lg";
    const variantClasses = {
        primary: "bg-primary text-white shadow-primary/20",
        secondary: "bg-gray-200 text-text-main",
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}
```

### Bước 3: Sử dụng Component

```jsx
import Button from "../../components/Button";

export default function MyPage() {
    return (
        <div>
            <Button variant="primary" onClick={() => alert("Clicked!")}>
                Click Me
            </Button>
        </div>
    );
}
```

---

## 🔌 Thêm Tính năng mới (New Feature)

### Ví dụ: Thêm feature "Wallet History"

### Bước 1: Tạo cấu trúc thư mục

```bash
mkdir -p src/features/wallet/pages
mkdir -p src/features/wallet/components
```

### Bước 2: Tạo Page

File `src/features/wallet/pages/WalletHistoryPage.jsx`:

```jsx
import TransactionList from "../components/TransactionList";

export default function WalletHistoryPage() {
    return (
        <div className="min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
            <TransactionList />
        </div>
    );
}
```

### Bước 3: Tạo Component (nếu cần)

File `src/features/wallet/components/TransactionList.jsx`:

```jsx
export default function TransactionList() {
    const transactions = [
        { id: 1, type: "Send", amount: -50, date: "2024-01-01" },
        { id: 2, type: "Receive", amount: 100, date: "2024-01-02" },
    ];

    return (
        <div className="space-y-4">
            {transactions.map((tx) => (
                <div key={tx.id} className="p-4 border rounded-xl">
                    <p>{tx.type}</p>
                    <p className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
                        ${tx.amount}
                    </p>
                    <p className="text-sm text-text-secondary">{tx.date}</p>
                </div>
            ))}
        </div>
    );
}
```

### Bước 4: Thêm Route

File `src/app/routes.jsx`:

```jsx
import WalletHistoryPage from "../features/wallet/pages/WalletHistoryPage";

// ... trong <Routes>
<Route path="/wallet/history" element={<WalletHistoryPage />} />
```

---

## 🌐 Kết nối API (Thêm Service)

### Bước 1: Tạo Service

File `src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:8080/api";

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) throw new Error("Login failed");
    return response.json();
};

export const getWalletHistory = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/wallet/${userId}/history`);
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
};
```

### Bước 2: Sử dụng trong Component

```jsx
import { useState, useEffect } from "react";
import { getWalletHistory } from "../../services/api";

export default function WalletHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getWalletHistory(123); // userId
                setTransactions(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            {/* Hiển thị transactions */}
        </div>
    );
}
```

---

## 📦 Thêm Package/Library mới

### Bước 1: Cài đặt package

```bash
npm install [package-name]
```

**Ví dụ phổ biến:**

```bash
# State management
npm install zustand

# Form validation
npm install react-hook-form zod

# Date handling
npm install date-fns

# Icons
npm install lucide-react

# HTTP client
npm install axios
```

### Bước 2: Import và sử dụng

```jsx
import axios from 'axios';
import { format } from 'date-fns';
```

---

## ✅ Checklist khi thêm tính năng mới

- [ ] Tạo component/page trong thư mục đúng
- [ ] Import đúng dependencies
- [ ] Thêm route vào `routes.jsx` (nếu là page)
- [ ] Test trên browser (`npm run dev`)
- [ ] Kiểm tra console không có error
- [ ] Styling phù hợp với design system hiện tại
- [ ] Code clean và có comment khi cần

---

## 🛠️ Commands quan trọng

### Development

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

### Package Management

```bash
# Cài đặt tất cả dependencies
npm install

# Cài thêm package
npm install [package-name]

# Remove package
npm uninstall [package-name]

# Update packages
npm update
```

### Troubleshooting

```bash
# Xóa node_modules và reinstall
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force

# Check outdated packages
npm outdated
```

---

## 🎯 Best Practices

### 1. **Cấu trúc file theo feature**

```
features/
  auth/
    pages/
    components/
    services/
  wallet/
    pages/
    components/
    services/
```

### 2. **Naming Convention**

- **Components**: PascalCase → `LoginPage.jsx`, `Button.jsx`
- **Files**: camelCase → `api.js`, `utils.js`
- **Folders**: lowercase → `auth/`, `components/`

### 3. **Component Pattern**

```jsx
// ✅ Good
export default function ComponentName({ prop1, prop2 }) {
    // State
    const [state, setState] = useState();
    
    // Effects
    useEffect(() => {}, []);
    
    // Handlers
    const handleClick = () => {};
    
    // Render
    return <div>...</div>;
}

// ❌ Avoid inline styles, prefer Tailwind classes
<div style={{ color: 'red' }}>Bad</div>

// ✅ Use Tailwind
<div className="text-red-600">Good</div>
```

### 4. **Import Order**

```jsx
// 1. React imports
import { useState, useEffect } from "react";

// 2. Third-party libraries
import { useNavigate } from "react-router-dom";

// 3. Internal imports
import Button from "../../components/Button";
import { loginUser } from "../../services/api";
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Trang hiển thị trống

**Giải pháp:**
1. Kiểm tra console browser có lỗi không
2. Verify route đã được thêm vào `routes.jsx`
3. Kiểm tra import path đúng chưa

### Issue 2: Module not found

**Giải pháp:**
```bash
npm install [missing-package]
```

### Issue 3: Port already in use

**Giải pháp:**
- Vite tự động thử port khác (5174, 5175...)
- Hoặc kill process đang dùng port 5173

### Issue 4: Changes không reflect

**Giải pháp:**
1. Save file
2. Check dev server đang chạy
3. Hard refresh browser (Ctrl + Shift + R)

---

## 📚 Tài liệu tham khảo

- **React**: https://react.dev/
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vite.dev/

---

**Cập nhật lần cuối:** 2025-12-17
