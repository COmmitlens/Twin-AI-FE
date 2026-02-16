# Production-Ready Authentication System

This Next.js application implements a **secure authentication system** using **HTTP-only cookies** for JWT storage.

## 🔒 Security Features

- ✅ **HTTP-only cookies** - Prevents XSS attacks (JavaScript can't access tokens)
- ✅ **Automatic cookie transmission** - Sent with every API request
- ✅ **Session validation** - Checks auth status on app load
- ✅ **Protected routes** - Redirects unauthorized users to login
- ✅ **Auto-redirect on token expiry** - Handles 401 errors globally

## 📁 File Structure

```
├── lib/
│   ├── axios.ts                 # Axios instance with cookie support
│   └── auth-context.tsx         # Auth context provider (useAuth hook)
├── components/
│   └── protected-route.tsx      # Protected route wrapper component
├── app/
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── sign-up/
│   │   └── page.tsx             # Registration page
│   ├── verify-otp/
│   │   └── [id]/[email]/
│   │       └── page.tsx         # OTP verification page
│   └── dashboard/
│       └── page.tsx             # Protected dashboard example
└── .env.local                   # Environment variables
```

## 🚀 Getting Started

### 1. Configure Environment Variables

Update `.env.local` with your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### 2. Backend Requirements

Your backend must support the following endpoints:

#### Authentication Endpoints

```
POST /auth/register        # Register new user
POST /auth/login           # Login user (sets HTTP-only cookie)
POST /auth/verify-otp      # Verify OTP for email confirmation
GET  /auth/validate        # Validate current session
GET  /auth/logout          # Logout user (clears cookie)
```

#### Expected Response Format

All responses should follow this format:

```json
{
  "message": "success",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### 3. Backend Cookie Configuration

#### Development (localhost)
```go
cookie := &http.Cookie{
    Name:     "Bearer",
    Value:    token,
    HttpOnly: true,
    Secure:   false,  // false for http://localhost
    Path:     "/",
    MaxAge:   86400,  // 24 hours
    SameSite: http.SameSiteLaxMode,
}
```

#### Production (HTTPS)
```go
cookie := &http.Cookie{
    Name:     "Bearer",
    Value:    token,
    HttpOnly: true,
    Secure:   true,   // true for HTTPS
    Path:     "/",
    MaxAge:   86400,
    SameSite: http.SameSiteNoneMode, // Important for cross-domain
    Domain:   ".yourdomain.com",     // Optional: share across subdomains
}
```

### 4. CORS Configuration

Your backend **must** enable credentials in CORS:

```go
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins:     []string{"https://yourdomain.com", "http://localhost:3000"},
    AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
    AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
    AllowCredentials: true, // CRITICAL for cookies
}))
```

## 📖 Usage Examples

### Using Authentication in Components

```tsx
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Creating Protected Pages

```tsx
import ProtectedRoute from '@/components/protected-route';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### Role-Based Protection

```tsx
import ProtectedRoute from '@/components/protected-route';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

### Making Authenticated API Calls

```tsx
import api from '@/lib/axios';

export async function fetchUserData() {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
}
```

## 🔄 Authentication Flow

### Registration Flow
1. User fills registration form → `/sign-up`
2. Submit → `POST /auth/register`
3. Backend sends OTP to email
4. Redirect to `/verify-otp/[id]/[email]`
5. User enters OTP → `POST /auth/verify-otp`
6. Success → Redirect to `/login`

### Login Flow
1. User enters credentials → `/login`
2. Submit → `POST /auth/login`
3. Backend sets HTTP-only cookie
4. Frontend updates auth state
5. Redirect to `/dashboard`

### Session Validation
1. App loads → `AuthProvider` mounts
2. Auto-call `GET /auth/validate`
3. If valid → Set user state
4. If invalid → Clear state (user remains logged out)

### Logout Flow
1. User clicks logout button
2. Call `GET /auth/logout`
3. Backend clears cookie
4. Frontend clears user state
5. Redirect to `/login`

## 🧪 Testing

### Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Verify OTP (use ID and OTP from registration response)
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"id":"user-id","email":"test@example.com","otp":"123456"}'

# 3. Login (save cookies)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# 4. Validate session (use saved cookies)
curl -X GET http://localhost:8080/api/v1/auth/validate \
  -b cookies.txt

# 5. Logout
curl -X GET http://localhost:8080/api/v1/auth/logout \
  -b cookies.txt
```

## 📝 Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login page |
| `/sign-up` | Public | Registration page |
| `/verify-otp/[id]/[email]` | Public | OTP verification |
| `/dashboard` | Protected | User dashboard |

## 🛠️ Customization

### Adding New Protected Routes

1. Create your page component
2. Wrap with `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/components/protected-route';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      {/* Your content */}
    </ProtectedRoute>
  );
}
```

### Adding Custom Auth Methods

Extend the `AuthContext` in `lib/auth-context.tsx`:

```tsx
const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return { success: true, message: 'Reset link sent' };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message };
  }
};

// Add to context value
const value = {
  // ...existing values
  forgotPassword,
};
```

## 🚨 Common Issues

### Issue: Cookies not sent with requests
**Solution:** Ensure `withCredentials: true` in axios config (already set in `lib/axios.ts`)

### Issue: CORS errors in browser
**Solution:** Backend must set `AllowCredentials: true` and use specific origin (not `*`)

### Issue: Session lost on page refresh
**Solution:** Already handled - `AuthProvider` validates session on mount

### Issue: 401 redirect loop
**Solution:** Ensure login/signup pages don't call protected endpoints

## 📦 Dependencies

```json
{
  "axios": "^1.13.5",
  "next": "16.1.6",
  "react": "^19",
  "next-themes": "^0.4.6"
}
```

## 🔐 Security Recommendations

1. ✅ **HTTP-only cookies** - Already implemented
2. ✅ **HTTPS in production** - Configure in deployment
3. ✅ **Short token expiry** - Set in backend (recommended: 24 hours)
4. ⚠️ **CSRF protection** - Implement if needed for state-changing requests
5. ⚠️ **Rate limiting** - Add to backend auth endpoints
6. ⚠️ **Refresh tokens** - Optional, for longer sessions

## 📚 Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTTP-only Cookie Security](https://owasp.org/www-community/HttpOnly)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

## 🤝 Support

For issues or questions:
1. Check the common issues section above
2. Verify backend endpoints are working
3. Check browser console for errors
4. Review axios network requests in DevTools

---

**Built with security in mind** 🔒
