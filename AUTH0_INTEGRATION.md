# Auth0 Integration for JustDeen MyCompanion

## Overview

JustDeen MyCompanion now uses Auth0 for authentication, which provides:
- **Universal Login** - Secure, branded authentication page
- **Multiple Identity Providers** - Google, Apple, Email/Password
- **Easy Configuration** - Manage authentication settings via Auth0 Dashboard
- **Security** - Industry-standard OAuth 2.0 / OpenID Connect

---

## Current Configuration

### Auth0 Credentials

- **Domain**: `justdeen.au.auth0.com`
- **Client ID**: `EEb2Paneq7GTvU04LYLrJ7ge6KZV77LW`
- **Bundle ID**: `com.husainshah.justdeen`

### Environment Variables (`.env`)

```env
AUTH0_DOMAIN=justdeen.au.auth0.com
AUTH0_CLIENT_ID=EEb2Paneq7GTvU04LYLrJ7ge6KZV77LW
```

---

## Auth0 Dashboard Configuration

### Step 1: Configure Allowed Callback URLs

In Auth0 Dashboard → Applications → JustDeen → Settings:

```
com.husainshah.justdeen://justdeen.au.auth0.com/ios/com.husainshah.justdeen/callback
```

### Step 2: Configure Allowed Logout URLs

```
com.husainshah.justdeen://justdeen.au.auth0.com/ios/com.husainshah.justdeen/callback
```

### Step 3: Enable Social Connections

Auth0 Dashboard → Authentication → Social:

- ✅ **Google** - Enable Google OAuth
- ✅ **Apple** - Enable Sign in with Apple
- ✅ **Facebook** - Enable Facebook Login
- ✅ **Microsoft** - Enable Microsoft Account
- ✅ **Twitter** - Enable Twitter Login

**Note**: Email/Password authentication is NOT enabled - users must sign in with social providers.

### Step 4: Configure Universal Login

Auth0 Dashboard → Branding → Universal Login:

- Customize logo (use JustDeen app icon)
- Set primary color: `#5856D6` (SF Purple)
- Customize login page with Islamic branding

---

## Code Architecture

### 1. Authentication Service ([app/services/auth/authService.ts](app/services/auth/authService.ts))

```typescript
import Auth0 from "react-native-auth0"
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from "@env"

const auth0 = new Auth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
})

export const signInWithAuth0 = async (): Promise<AuthResult> => {
  const credentials = await auth0.webAuth.authorize({
    scope: "openid profile email",
  })
  // Returns: accessToken, idToken, user info
}

export const signOut = async () => {
  await auth0.webAuth.clearSession()
}
```

### 2. Authentication Context ([app/context/AuthContext.tsx](app/context/AuthContext.tsx))

```typescript
export type AuthContextType = {
  isAuthenticated: boolean
  user: JustDeenUser | null
  signInWithAuth0: () => Promise<{ success: boolean; error?: string }>
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}
```

### 3. Login Screen ([app/screens/LoginScreen.tsx](app/screens/LoginScreen.tsx))

- **"Sign In" button** - Opens Auth0 Universal Login (Google, Apple, Facebook, Microsoft, Twitter)
- **"Continue as Guest" button** - Anonymous sign-in

---

## User Flow

1. **User taps "Sign In"**
   - Opens Auth0 Universal Login in Safari (iOS)
   - User selects from: Google, Apple, Facebook, Microsoft, or Twitter
   - User authenticates with chosen provider
   - Auth0 redirects back to app with tokens

2. **App receives tokens**
   - `accessToken` - Used for API calls
   - `idToken` - User identity verification
   - `userInfo` - Email, name, profile picture

3. **App stores user data**
   - Saved to MMKV storage (fast, encrypted)
   - Synced with Cloudflare D1 API
   - Available offline

4. **User signs out**
   - Clears local storage
   - Calls Auth0 logout endpoint
   - Redirects to Login screen

---

## Testing on iPhone

### Before Testing

1. **Configure Auth0 Dashboard**
   - Set callback URLs (see above)
   - Enable Google/Apple social connections
   - Test Universal Login page

2. **Build and deploy to iPhone**
   ```bash
   npx expo run:ios --device
   ```

### Testing Steps

1. **Launch app** → Login screen appears
2. **Tap "Sign In"**
   - Safari opens with Auth0 login page
   - Branded with JustDeen logo and colors
3. **Select authentication method**
   - **Google** (requires Google account)
   - **Apple** (requires Apple ID)
   - **Facebook** (requires Facebook account)
   - **Microsoft** (requires Microsoft account)
   - **Twitter** (requires Twitter account)
4. **Complete authentication**
   - App redirects back
   - User is logged in
   - Main tabs appear
5. **Test "Continue as Guest"**
   - Anonymous sign-in (no account required)
   - Limited features (no sync, no bookmarks)

---

## Troubleshooting

### Issue: "Invalid Callback URL"

**Cause**: Auth0 Dashboard not configured with correct callback URL

**Fix**: Add callback URL to Auth0 Dashboard → Applications → Settings:
```
com.husainshah.justdeen://justdeen.au.auth0.com/ios/com.husainshah.justdeen/callback
```

### Issue: "User Cancelled"

**Cause**: User closed Safari without completing authentication

**Fix**: Normal behavior - no action needed

### Issue: Social Providers Not Appearing

**Cause**: Social connections not enabled in Auth0 Dashboard

**Fix**: Auth0 Dashboard → Authentication → Social → Enable desired providers (Google, Apple, Facebook, Microsoft, Twitter)

### Issue: "Could not sign in"

**Cause**: Network error or Auth0 configuration issue

**Fix**:
1. Check internet connection
2. Verify Auth0 credentials in `.env`
3. Check Auth0 Dashboard → Applications → Settings

---

## Security Considerations

1. **Token Storage**
   - Tokens stored in MMKV (encrypted by iOS)
   - Never stored in AsyncStorage
   - Cleared on logout

2. **Token Refresh**
   - Access tokens expire after 24 hours
   - Refresh tokens used to get new access tokens
   - Implemented in Auth0 SDK

3. **Social Authentication**
   - Google/Apple handle their own security
   - Auth0 validates tokens
   - User data synced with Cloudflare D1

4. **Anonymous Users**
   - Limited access (no bookmarks, no sync)
   - Can upgrade to authenticated account
   - Data not persisted across reinstalls

---

## Migration from Google/Apple Sign-In

### Removed Dependencies

```json
// package.json - REMOVED
"@react-native-google-signin/google-signin"
"@invertase/react-native-apple-authentication"
```

### Added Dependencies

```json
// package.json - ADDED
"react-native-auth0": "^3.x"
```

### Code Changes

- `authService.ts` - Replaced Google/Apple methods with Auth0
- `AuthContext.tsx` - Updated context API
- `LoginScreen.tsx` - New UI with single "Sign In" button
- `app.json` - Added CFBundleURLSchemes for Auth0 callback

---

## Next Steps

1. **Configure Auth0 Dashboard**
   - Set callback URLs
   - Enable social connections
   - Customize Universal Login branding

2. **Test on iPhone**
   - Deploy to physical device
   - Test Google sign-in
   - Test Apple sign-in
   - Test Email/Password sign-in

3. **Production Considerations**
   - Set up production Auth0 tenant
   - Configure custom domain (auth.justdeen.com)
   - Enable MFA (Multi-Factor Authentication)
   - Set up Auth0 Actions for custom logic

---

**Last Updated**: November 10, 2025
**Auth0 SDK Version**: react-native-auth0 ^3.x
**iOS Bundle ID**: com.husainshah.justdeen
