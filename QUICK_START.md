# Quick Start Guide - Authentication System

## ✅ What's Been Set Up

Your Next.js app now has a complete, production-ready authentication system with HTTP-only cookies!

### 📦 Installed Dependencies
- ✅ `axios` - HTTP client with cookie support

### 📁 Files Created

1. **Environment Configuration**
   - `.env.local` - Your API URL configuration
   - `.env.example` - Template for other developers

2. **Core Auth Files**
   - `lib/axios.ts` - Axios instance configured for HTTP-only cookies
   - `lib/auth-context.tsx` - Auth context with `useAuth()` hook

3. **Auth Pages**
   - `app/login/page.tsx` - Login page
   - `app/sign-up/page.tsx` - Registration page (updated)
   - `app/verify-otp/[id]/[email]/page.tsx` - OTP verification page
   - `app/dashboard/page.tsx` - Protected dashboard example

4. **Components**
   - `components/protected-route.tsx` - Wrapper for protected pages

5. **Documentation**
   - `AUTH_README.md` - Complete auth system documentation

---

## 🚀 Getting Started

### Step 1: Configure Your Backend URL

The `.env.local` file is already set up with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Change this if your backend runs on a different port or URL.**

### Step 2: Ensure Your Backend Is Running

Your Go backend should be running with these endpoints:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-otp` - OTP verification
- `GET /api/v1/auth/validate` - Session validation
- `GET /api/v1/auth/logout` - User logout

### Step 3: Start Your Next.js Dev Server

```bash
pnpm dev
```

### Step 4: Test the Authentication Flow

1. **Visit** http://localhost:3000/sign-up
2. **Fill in** the registration form
3. **You'll be redirected** to OTP verification
4. **After OTP verification**, you'll be sent to login
5. **Login** with your credentials
6. **You'll be redirected** to the dashboard

---

## 🔧 Common Configuration

### If Your Backend Uses Different Cookie Name

Default cookie name is `Bearer`. If different, update `lib/axios.ts`:

```typescript
// axios automatically handles cookies, no changes needed
// Just ensure your backend sets the cookie name correctly
```

### If Your Backend Returns Different Response Format

Expected format:
```json
{
  "message": "success",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

If your backend uses a different format, update `lib/auth-context.tsx`:
```typescript
// Change this line in login, register, etc:
if (response.data.message === 'success') {
  // to match your backend response structure
}
```

---

## 🎯 Using the Auth System

### In Any Component

```tsx
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
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
      <div>Your protected content here</div>
    </ProtectedRoute>
  );
}
```

### Making Authenticated API Calls

```tsx
import api from '@/lib/axios';

async function fetchData() {
  try {
    const response = await api.get('/books/getall');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🧪 Testing Your Setup

### Test 1: Registration Flow
1. Go to `/sign-up`
2. Fill the form
3. Check if you're redirected to OTP page
4. Check browser DevTools → Network tab
5. Look for `POST /auth/register` request

### Test 2: Login Flow
1. Go to `/login`
2. Enter credentials
3. Check Network tab for `POST /auth/login`
4. Check if you're redirected to `/dashboard`
5. In Application tab → Cookies, you should see `Bearer` cookie

### Test 3: Protected Routes
1. While logged in, visit `/dashboard`
2. You should see your dashboard
3. Logout
4. Try visiting `/dashboard` again
5. You should be redirected to `/login`

### Test 4: Session Persistence
1. Login to your account
2. Refresh the page
3. You should remain logged in
4. Check Network tab for `GET /auth/validate` request

---

## 🔍 Debugging

### Issue: "Network Error" or CORS Error

**Solution:** Your backend CORS must be configured:
```go
AllowOrigins: []string{"http://localhost:3000"},
AllowCredentials: true,
```

### Issue: Not Redirected After Login

**Check:**
1. Browser console for errors
2. Network tab - check if login request succeeded
3. Response data format matches expected format

### Issue: Cookie Not Being Set

**Check:**
1. Backend cookie configuration
2. Ensure `HttpOnly: true` and `Secure: false` (for localhost)
3. Cookie path is `/`
4. SameSite is `Lax` for development

### Issue: Session Lost on Refresh

**Check:**
1. `GET /auth/validate` endpoint is working
2. Cookie is still present (Application → Cookies)
3. Check console for validation errors

---

## 📚 Next Steps

1. **Read** `AUTH_README.md` for detailed documentation
2. **Customize** the dashboard page for your needs
3. **Add** more protected routes
4. **Implement** additional auth features (forgot password, etc.)
5. **Test** with your backend thoroughly

---

## 🎨 Customization Ideas

### Add a Forgot Password Page
1. Create `app/forgot-password/page.tsx`
2. Add `forgotPassword` method to `lib/auth-context.tsx`
3. Create the UI form

### Add Role-Based Access
Already supported! Use:
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### Add Loading Skeletons
Replace the loading spinner in `protected-route.tsx` with shadcn Skeleton component.

---

## 📞 Support

If you encounter issues:
1. Check `AUTH_README.md` - Common Issues section
2. Verify backend is running and endpoints work
3. Check browser console and network tab
4. Ensure environment variables are correct

---

**🎉 Your authentication system is ready to use!**

Start the dev server and test it out:
```bash
pnpm dev
```

Then visit: http://localhost:3000/sign-up
