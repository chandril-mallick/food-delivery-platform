# ✅ Pre-Commit Security Checklist

## 🚨 CRITICAL - Run Before Every Commit

### 1. Check for Sensitive Files

```bash
# Navigate to project root
cd /path/to/dabba-app

# Check if serviceAccountKey.json is tracked
echo "Checking for serviceAccountKey.json..."
git ls-files | grep -i serviceAccountKey
# ✅ Should return NOTHING

# Check if .env files are tracked
echo "Checking for .env files..."
git ls-files | grep "\.env$"
# ✅ Should return NOTHING (only .env.example is OK)

# Check for any Firebase admin keys
echo "Checking for Firebase admin keys..."
git ls-files | grep -i "firebase-adminsdk"
# ✅ Should return NOTHING
```

### 2. Scan for Exposed Secrets

```bash
# Check for private keys in code
echo "Scanning for private keys..."
git grep -i "private_key" -- ':!node_modules' ':!package-lock.json' ':!*.md'
# ✅ Should only show references in .gitignore or documentation

# Check for Firebase API keys in code (should only be in .env)
echo "Scanning for Firebase API keys..."
git grep "AIzaSy" -- ':!node_modules' ':!package-lock.json' ':!*.md'
# ✅ Should only appear in .env.example or documentation

# Check for Supabase keys
echo "Scanning for Supabase keys..."
git grep -i "supabase.*key" -- ':!node_modules' ':!package-lock.json' ':!*.md'
# ✅ Should only appear in .env.example or documentation
```

### 3. Verify .gitignore Files

```bash
# Check root .gitignore exists
test -f .gitignore && echo "✅ Root .gitignore exists" || echo "❌ Root .gitignore missing"

# Check frontend .gitignore exists
test -f frontend/.gitignore && echo "✅ Frontend .gitignore exists" || echo "❌ Frontend .gitignore missing"

# Check backend .gitignore exists
test -f food-delivery-server/.gitignore && echo "✅ Backend .gitignore exists" || echo "❌ Backend .gitignore missing"
```

### 4. Verify Example Files

```bash
# Check .env.example files exist
test -f frontend/.env.example && echo "✅ Frontend .env.example exists" || echo "❌ Frontend .env.example missing"
test -f food-delivery-server/.env.example && echo "✅ Backend .env.example exists" || echo "❌ Backend .env.example missing"
```

### 5. Check Staged Files

```bash
# List all staged files
echo "Staged files:"
git diff --cached --name-only

# Verify no sensitive files are staged
echo "Checking staged files for sensitive content..."
git diff --cached --name-only | grep -E "(serviceAccountKey|\.env$|firebase-adminsdk)" && echo "❌ SENSITIVE FILE STAGED!" || echo "✅ No sensitive files staged"
```

## 🔍 Quick Security Scan Script

Save this as `security-check.sh` in project root:

```bash
#!/bin/bash

echo "🔍 Running Security Checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: serviceAccountKey.json
echo "1. Checking for serviceAccountKey.json..."
if git ls-files | grep -q serviceAccountKey; then
    echo -e "${RED}❌ CRITICAL: serviceAccountKey.json is tracked!${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No serviceAccountKey.json tracked${NC}"
fi

# Check 2: .env files
echo "2. Checking for .env files..."
if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}❌ CRITICAL: .env file is tracked!${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No .env files tracked${NC}"
fi

# Check 3: Firebase admin keys
echo "3. Checking for Firebase admin keys..."
if git ls-files | grep -qi "firebase-adminsdk"; then
    echo -e "${RED}❌ CRITICAL: Firebase admin key is tracked!${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No Firebase admin keys tracked${NC}"
fi

# Check 4: Private keys in code
echo "4. Scanning for private keys in code..."
if git grep -qi "BEGIN PRIVATE KEY" -- ':!node_modules' ':!*.md' 2>/dev/null; then
    echo -e "${RED}❌ WARNING: Private key found in code!${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No private keys in code${NC}"
fi

# Check 5: .gitignore files
echo "5. Checking .gitignore files..."
MISSING_GITIGNORE=0
test -f .gitignore || { echo -e "${YELLOW}⚠️  Root .gitignore missing${NC}"; MISSING_GITIGNORE=1; }
test -f frontend/.gitignore || { echo -e "${YELLOW}⚠️  Frontend .gitignore missing${NC}"; MISSING_GITIGNORE=1; }
test -f food-delivery-server/.gitignore || { echo -e "${YELLOW}⚠️  Backend .gitignore missing${NC}"; MISSING_GITIGNORE=1; }

if [ $MISSING_GITIGNORE -eq 0 ]; then
    echo -e "${GREEN}✅ All .gitignore files present${NC}"
fi

# Check 6: .env.example files
echo "6. Checking .env.example files..."
MISSING_EXAMPLES=0
test -f frontend/.env.example || { echo -e "${YELLOW}⚠️  Frontend .env.example missing${NC}"; MISSING_EXAMPLES=1; }
test -f food-delivery-server/.env.example || { echo -e "${YELLOW}⚠️  Backend .env.example missing${NC}"; MISSING_EXAMPLES=1; }

if [ $MISSING_EXAMPLES -eq 0 ]; then
    echo -e "${GREEN}✅ All .env.example files present${NC}"
fi

# Final result
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL SECURITY CHECKS PASSED!${NC}"
    echo "Safe to commit and push to GitHub"
    exit 0
else
    echo -e "${RED}❌ SECURITY CHECKS FAILED: $ERRORS critical issue(s)${NC}"
    echo "DO NOT COMMIT OR PUSH TO GITHUB!"
    echo "Fix the issues above before proceeding"
    exit 1
fi
```

Make it executable:
```bash
chmod +x security-check.sh
```

Run before every commit:
```bash
./security-check.sh
```

## 📋 Manual Verification Checklist

Before pushing to GitHub, manually verify:

### Critical Files (Must NOT be committed)
- [ ] ❌ `food-delivery-server/serviceAccountKey.json`
- [ ] ❌ `frontend/.env`
- [ ] ❌ `food-delivery-server/.env`
- [ ] ❌ Any `firebase-adminsdk-*.json` files
- [ ] ❌ `.firebaserc` (contains project IDs)

### Required Files (Must be committed)
- [ ] ✅ `.gitignore` (root)
- [ ] ✅ `frontend/.gitignore`
- [ ] ✅ `food-delivery-server/.gitignore`
- [ ] ✅ `frontend/.env.example`
- [ ] ✅ `food-delivery-server/.env.example`
- [ ] ✅ `README.md`
- [ ] ✅ `SECURITY.md`
- [ ] ✅ `LICENSE`

### Documentation
- [ ] ✅ README has clear setup instructions
- [ ] ✅ No actual credentials in documentation
- [ ] ✅ Clear instructions for obtaining Firebase keys
- [ ] ✅ Security guidelines documented

### Code Review
- [ ] ✅ No hardcoded API keys in source code
- [ ] ✅ All sensitive data uses environment variables
- [ ] ✅ No console.log with sensitive information
- [ ] ✅ No commented-out credentials

## 🚀 Safe to Push Checklist

Only push to GitHub when ALL of these are true:

1. ✅ Security check script passes
2. ✅ No sensitive files in git history
3. ✅ All .gitignore files properly configured
4. ✅ All .env.example files created
5. ✅ Documentation complete and accurate
6. ✅ No credentials in code or documentation
7. ✅ README has clear setup instructions
8. ✅ SECURITY.md guidelines documented

## 🆘 If You Accidentally Committed Secrets

**STOP! Do not push to GitHub!**

### Option 1: Amend Last Commit (if not pushed)
```bash
# Remove the file
git rm --cached food-delivery-server/serviceAccountKey.json

# Amend the commit
git commit --amend --no-edit
```

### Option 2: Reset to Previous Commit (if not pushed)
```bash
# Reset to previous commit
git reset HEAD~1

# Re-add files carefully
git add <safe-files-only>
git commit -m "Your commit message"
```

### Option 3: Already Pushed (CRITICAL)
1. **Immediately revoke all exposed credentials**
2. **Contact your team**
3. **Consider creating a fresh repository**
4. **Follow SECURITY.md guidelines for credential rotation**

## 📞 Need Help?

If you're unsure about any file:
1. Check SECURITY.md
2. Review .gitignore patterns
3. When in doubt, DON'T commit it
4. Ask for code review

---

**Remember: It's better to be safe than sorry. Always run security checks before committing!**
