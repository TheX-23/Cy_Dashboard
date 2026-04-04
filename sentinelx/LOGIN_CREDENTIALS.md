# SentinelX Login Credentials

## 🔐 Authentication System

The SentinelX dashboard uses a mock authentication system with predefined user credentials. Below are the available login accounts:

---

## 👤 **Available User Accounts**

### **🔑 Administrator Account**
```
Email: admin@sentinelx.com
Password: admin123
Role: Administrator
Access: Full system access, user management, all dashboard features
```

### **🛡️ Security Analyst Account**
```
Email: security@sentinelx.com
Password: security123
Role: Security Analyst
Access: Threat monitoring, incident response, security analytics
```

### **📊 Threat Analyst Account**
```
Email: analyst@sentinelx.com
Password: analyst123
Role: Analyst
Access: Data analysis, reporting, threat intelligence
```

### **👨‍💻 Demo User Account**
```
Email: demo@sentinelx.com
Password: demo123
Role: User
Access: Basic dashboard view, limited features
```

---

## 🚀 **Quick Login**

### **For Testing & Development**
Use the **Administrator** account for full access:
- **Email**: `admin@sentinelx.com`
- **Password**: `admin123`

---

## 🔧 **Authentication Features**

### **✅ Security Features**
- **Mock JWT Token**: Generated on successful login
- **Session Management**: Stored in localStorage
- **Route Protection**: Dashboard pages require authentication
- **Auto-Logout**: Clear session on logout
- **Error Handling**: Invalid credential messages

### **✅ User Interface**
- **Professional Login Page**: Modern dark theme
- **Password Visibility Toggle**: Show/hide password
- **Loading States**: Spinner during authentication
- **Error Messages**: Clear feedback for invalid credentials
- **Responsive Design**: Works on all devices

---

## 🛠️ **Technical Implementation**

### **Authentication Flow**
1. User enters credentials on login page
2. Credentials validated against mock database
3. JWT token generated and stored
4. User data stored in localStorage
5. Redirect to dashboard
6. Route protection checks token on each page

### **Session Management**
```typescript
// Token Storage
localStorage.setItem('token', 'mock-jwt-token-' + Date.now());

// User Data Storage
localStorage.setItem('user', JSON.stringify(user));

// Route Protection
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login';
}
```

---

## 🔒 **Security Notes**

### **⚠️ Development Mode**
- This is a **mock authentication system** for development
- **No real backend** - credentials are hardcoded
- **Do not use in production** without proper backend

### **🛡️ Production Recommendations**
- Implement real JWT authentication
- Use secure backend API
- Add password hashing
- Implement role-based access control
- Add session timeout
- Enable multi-factor authentication

---

## 🎯 **User Roles & Permissions**

### **🔑 Administrator**
- ✅ Full dashboard access
- ✅ User management
- ✅ System configuration
- ✅ All security features

### **🛡️ Security Analyst**
- ✅ Threat monitoring
- ✅ Incident response
- ✅ Security analytics
- ❌ User management

### **📊 Analyst**
- ✅ Data analysis
- ✅ Reporting
- ✅ Threat intelligence
- ❌ System configuration

### **👨‍💻 Demo User**
- ✅ Basic dashboard view
- ✅ Limited features
- ❌ Advanced analytics
- ❌ Administrative functions

---

## 🚀 **Getting Started**

1. **Navigate to login page**: `http://localhost:3000/login`
2. **Enter credentials**: Use any account from above
3. **Click "Login to Dashboard"**
4. **Access granted**: Redirected to main dashboard
5. **Logout**: Click user avatar → Logout

---

## 📞 **Support**

For authentication issues:
1. Check credentials are entered correctly
2. Ensure browser allows localStorage
3. Clear browser cache if needed
4. Use administrator account for full access

---

*Last Updated: April 3, 2026*
*System: SentinelX v1.0*
