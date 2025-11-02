#!/bin/bash

echo "🔍 Running Security Checks for Dabba App..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Dabba App - Pre-Commit Security Scanner${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check 1: serviceAccountKey.json
echo "1️⃣  Checking for serviceAccountKey.json..."
if git ls-files | grep -q serviceAccountKey; then
    echo -e "${RED}❌ CRITICAL: serviceAccountKey.json is tracked in git!${NC}"
    echo -e "${RED}   This file contains private Firebase credentials!${NC}"
    git ls-files | grep serviceAccountKey
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No serviceAccountKey.json tracked${NC}"
fi
echo ""

# Check 2: .env files
echo "2️⃣  Checking for .env files..."
ENV_FILES=$(git ls-files | grep "\.env$" | grep -v "\.env\.example")
if [ ! -z "$ENV_FILES" ]; then
    echo -e "${RED}❌ CRITICAL: .env file(s) are tracked in git!${NC}"
    echo -e "${RED}   These files contain sensitive API keys!${NC}"
    echo "$ENV_FILES"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No .env files tracked (only .env.example is safe)${NC}"
fi
echo ""

# Check 3: Firebase admin keys
echo "3️⃣  Checking for Firebase admin SDK keys..."
if git ls-files | grep -qi "firebase-adminsdk"; then
    echo -e "${RED}❌ CRITICAL: Firebase admin SDK key is tracked!${NC}"
    git ls-files | grep -i "firebase-adminsdk"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No Firebase admin keys tracked${NC}"
fi
echo ""

# Check 4: Private keys in code
echo "4️⃣  Scanning for private keys in code..."
if git grep -qi "BEGIN PRIVATE KEY" -- ':!node_modules' ':!*.md' ':!PRE_COMMIT_CHECKLIST.md' 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: Private key found in tracked files!${NC}"
    git grep -i "BEGIN PRIVATE KEY" -- ':!node_modules' ':!*.md' ':!PRE_COMMIT_CHECKLIST.md' | head -5
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ No private keys found in code${NC}"
fi
echo ""

# Check 5: Hardcoded API keys
echo "5️⃣  Scanning for hardcoded Firebase API keys..."
HARDCODED_KEYS=$(git grep "AIzaSy" -- ':!node_modules' ':!package-lock.json' ':!*.md' ':!PRODUCTION_SETUP.md' 2>/dev/null | grep -v "\.env\.example" | grep -v "your_firebase_api_key")
if [ ! -z "$HARDCODED_KEYS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Potential hardcoded API keys found${NC}"
    echo "$HARDCODED_KEYS" | head -5
    WARNINGS=$((WARNINGS+1))
else
    echo -e "${GREEN}✅ No hardcoded API keys found${NC}"
fi
echo ""

# Check 6: .gitignore files
echo "6️⃣  Checking .gitignore files..."
MISSING_GITIGNORE=0
if [ ! -f .gitignore ]; then
    echo -e "${RED}❌ Root .gitignore missing${NC}"
    ERRORS=$((ERRORS+1))
    MISSING_GITIGNORE=1
fi
if [ ! -f frontend/.gitignore ]; then
    echo -e "${YELLOW}⚠️  Frontend .gitignore missing${NC}"
    WARNINGS=$((WARNINGS+1))
    MISSING_GITIGNORE=1
fi
if [ ! -f food-delivery-server/.gitignore ]; then
    echo -e "${YELLOW}⚠️  Backend .gitignore missing${NC}"
    WARNINGS=$((WARNINGS+1))
    MISSING_GITIGNORE=1
fi

if [ $MISSING_GITIGNORE -eq 0 ]; then
    echo -e "${GREEN}✅ All .gitignore files present${NC}"
fi
echo ""

# Check 7: .env.example files
echo "7️⃣  Checking .env.example files..."
MISSING_EXAMPLES=0
if [ ! -f frontend/.env.example ]; then
    echo -e "${YELLOW}⚠️  Frontend .env.example missing${NC}"
    WARNINGS=$((WARNINGS+1))
    MISSING_EXAMPLES=1
fi
if [ ! -f food-delivery-server/.env.example ]; then
    echo -e "${YELLOW}⚠️  Backend .env.example missing${NC}"
    WARNINGS=$((WARNINGS+1))
    MISSING_EXAMPLES=1
fi

if [ $MISSING_EXAMPLES -eq 0 ]; then
    echo -e "${GREEN}✅ All .env.example files present${NC}"
fi
echo ""

# Check 8: Verify serviceAccountKey.json is gitignored
echo "8️⃣  Verifying serviceAccountKey.json is in .gitignore..."
if [ -f food-delivery-server/serviceAccountKey.json ]; then
    if git check-ignore -q food-delivery-server/serviceAccountKey.json; then
        echo -e "${GREEN}✅ serviceAccountKey.json exists and is properly gitignored${NC}"
    else
        echo -e "${RED}❌ CRITICAL: serviceAccountKey.json exists but is NOT gitignored!${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${GREEN}✅ serviceAccountKey.json not present (will need to be added for deployment)${NC}"
fi
echo ""

# Check 9: Check staged files
echo "9️⃣  Checking staged files..."
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null)
if [ ! -z "$STAGED_FILES" ]; then
    SENSITIVE_STAGED=$(echo "$STAGED_FILES" | grep -E "(serviceAccountKey|\.env$|firebase-adminsdk)")
    if [ ! -z "$SENSITIVE_STAGED" ]; then
        echo -e "${RED}❌ CRITICAL: Sensitive files are staged for commit!${NC}"
        echo "$SENSITIVE_STAGED"
        ERRORS=$((ERRORS+1))
    else
        echo -e "${GREEN}✅ No sensitive files staged${NC}"
        echo "Staged files:"
        echo "$STAGED_FILES" | sed 's/^/   /'
    fi
else
    echo -e "${YELLOW}⚠️  No files staged for commit${NC}"
fi
echo ""

# Final result
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}              SECURITY SCAN RESULTS${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ✅ ✅  ALL SECURITY CHECKS PASSED!  ✅ ✅ ✅${NC}"
    echo ""
    echo -e "${GREEN}Your code is safe to commit and push to GitHub!${NC}"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  SECURITY CHECKS PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}   Found $WARNINGS warning(s)${NC}"
    echo ""
    echo "Review the warnings above. You can proceed with caution."
    echo ""
    exit 0
else
    echo -e "${RED}❌ ❌ ❌  SECURITY CHECKS FAILED!  ❌ ❌ ❌${NC}"
    echo ""
    echo -e "${RED}Critical Issues: $ERRORS${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo ""
    echo -e "${RED}DO NOT COMMIT OR PUSH TO GITHUB!${NC}"
    echo ""
    echo "Fix the critical issues above before proceeding."
    echo "See SECURITY.md and PRE_COMMIT_CHECKLIST.md for guidance."
    echo ""
    exit 1
fi
