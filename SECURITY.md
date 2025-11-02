# 🔒 Security Guidelines for Dabba App

## ⚠️ CRITICAL - Before Uploading to GitHub

### Files That MUST NEVER Be Committed

#### 🚨 Extremely Sensitive (Private Keys)
- ❌ `food-delivery-server/serviceAccountKey.json` - Firebase Admin SDK private key
- ❌ Any file matching `*serviceAccountKey*.json`
- ❌ Any file matching `firebase-adminsdk*.json`

#### 🔐 Sensitive (API Keys & Credentials)
- ❌ `.env` files in any directory
- ❌ `.env.local`, `.env.development.local`, `.env.production.local`
- ❌ Any file containing API keys or secrets

#### 📝 Configuration Files
- ❌ `.firebaserc` - Firebase project configuration
- ❌ `firebase-debug.log` - May contain sensitive data

## ✅ Pre-Upload Checklist

### 1. Verify .gitignore Files
Ensure these files exist and are properly configured:
- ✅ `/dabba-app/.gitignore` (root)
- ✅ `/dabba-app/frontend/.gitignore`
- ✅ `/dabba-app/food-delivery-server/.gitignore`

### 2. Check for Exposed Secrets
Run these commands before committing:

```bash
# Check if serviceAccountKey.json is tracked
git ls-files | grep serviceAccountKey

# Check if .env files are tracked
git ls-files | grep "\.env"

# Check for any private keys in tracked files
git grep -i "private_key" -- ':!node_modules'

# Check for API keys in tracked files
git grep -i "AIzaSy" -- ':!node_modules'
```

**If any of these return results, DO NOT PUSH TO GITHUB!**

### 3. Remove Sensitive Files from Git History
If you accidentally committed sensitive files:

```bash
# Remove file from git history (DANGEROUS - creates new history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch food-delivery-server/serviceAccountKey.json" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if repository is private or not yet pushed)
git push origin --force --all
```

**⚠️ Better approach: Create a new repository and copy only safe files**

### 4. Verify Environment Variables
- ✅ All `.env.example` files created
- ✅ No actual credentials in example files
- ✅ Clear instructions in README for obtaining credentials

## 🛡️ Security Best Practices

### Firebase Admin SDK
1. **Never commit** `serviceAccountKey.json`
2. Store it securely outside version control
3. Use environment variables in production
4. Rotate keys if exposed

### API Keys
1. Use environment variables for all API keys
2. Never hardcode credentials in source code
3. Use different keys for development and production
4. Implement key rotation policy

### Firestore Security Rules
Ensure proper security rules are configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users only
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /menuItems/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### Authentication
1. Enable only required auth providers
2. Implement rate limiting for OTP requests
3. Use HTTPS in production
4. Validate all user inputs
5. Implement CSRF protection

## 🔍 What's Safe to Commit

### ✅ Safe Files
- Source code (`.js`, `.jsx`, `.ts`, `.tsx`)
- Configuration templates (`.env.example`)
- Documentation (`.md` files)
- Package files (`package.json`, `package-lock.json`)
- Public assets (images, icons)
- Build configurations (`tailwind.config.js`, etc.)

### ⚠️ Review Before Committing
- Configuration files (may contain project IDs)
- README files (ensure no credentials in examples)
- Test files (may contain test credentials)

## 🚨 If Credentials Are Exposed

### Immediate Actions
1. **Revoke compromised credentials immediately**
   - Firebase: Generate new service account key
   - Supabase: Rotate API keys
   - Any other exposed services

2. **Remove from Git history**
   - Use `git filter-branch` or BFG Repo-Cleaner
   - Or create fresh repository

3. **Update all instances**
   - Update credentials in production
   - Update team members
   - Update documentation

4. **Monitor for abuse**
   - Check Firebase/Supabase usage logs
   - Monitor for unauthorized access
   - Set up alerts for unusual activity

### Firebase Service Account Compromise
1. Go to Firebase Console > Project Settings > Service Accounts
2. Delete compromised service account
3. Generate new private key
4. Update all production instances
5. Review Firestore audit logs

### Supabase API Key Compromise
1. Go to Supabase Dashboard > Project Settings > API
2. Rotate compromised keys
3. Update all applications
4. Review authentication logs

## 📋 Deployment Security

### Production Environment Variables
Never expose these in client-side code:
- Firebase Admin SDK credentials
- Database connection strings
- Third-party API secrets
- Payment gateway keys

### Client-Side vs Server-Side
**Client-Side (Safe to expose):**
- Firebase public API keys
- Supabase anon keys (with proper RLS)
- Public CDN URLs

**Server-Side (Keep secret):**
- Firebase Admin SDK keys
- Database credentials
- Payment processor secrets
- JWT signing keys

## 🔐 Recommended Tools

### Secret Scanning
- **git-secrets** - Prevents committing secrets
- **truffleHog** - Finds secrets in git history
- **GitHub Secret Scanning** - Automatic detection

### Installation
```bash
# git-secrets
brew install git-secrets
git secrets --install
git secrets --register-aws

# truffleHog
pip install truffleHog
truffleHog --regex --entropy=False .
```

## 📞 Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public GitHub issue
2. Email security concerns privately
3. Include detailed description
4. Allow time for fix before disclosure

## 📚 Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Remember: Security is everyone's responsibility. When in doubt, don't commit it!**
