# 🤝 Contributing to Dabba Food Delivery App

Thank you for your interest in contributing to Dabba! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Security Guidelines](#security-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/dabba-app.git
cd dabba-app
```

### 2. Set Up Development Environment

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../food-delivery-server
npm install
```

### 3. Configure Environment Variables

```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env with your Firebase and Supabase credentials

# Backend
cd ../food-delivery-server
cp .env.example .env
# Add your serviceAccountKey.json (never commit this!)
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 💻 Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-payment-gateway`)
- `fix/` - Bug fixes (e.g., `fix/cart-calculation-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-queries`)
- `test/` - Adding tests (e.g., `test/add-cart-tests`)

### Running the Development Server

```bash
# Terminal 1 - Frontend
cd frontend
npm start
# Runs on http://localhost:3000

# Terminal 2 - Backend
cd food-delivery-server
npm start
# Runs on http://localhost:4000
```

### Making Changes

1. **Write clean, readable code**
2. **Follow existing code style**
3. **Add comments for complex logic**
4. **Update documentation if needed**
5. **Test your changes thoroughly**

## 🔒 Security Guidelines

### Before Every Commit

**ALWAYS run the security check:**

```bash
./security-check.sh
```

### Never Commit These Files

- ❌ `serviceAccountKey.json`
- ❌ `.env` files (only `.env.example` is OK)
- ❌ Any file with `firebase-adminsdk` in the name
- ❌ Files containing private keys or secrets

### If You Accidentally Commit Secrets

1. **STOP** - Do not push to GitHub
2. Remove the file from git:
   ```bash
   git rm --cached path/to/sensitive/file
   git commit --amend --no-edit
   ```
3. Rotate all exposed credentials immediately
4. See `SECURITY.md` for detailed recovery steps

## 📝 Coding Standards

### JavaScript/React

```javascript
// Use functional components with hooks
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects here
  }, [dependencies]);
  
  return (
    <div className="container">
      {/* JSX here */}
    </div>
  );
};

// Use descriptive variable names
const userOrderHistory = getUserOrders(userId);

// Add PropTypes for components
MyComponent.propTypes = {
  userId: PropTypes.string.isRequired,
  onComplete: PropTypes.func
};
```

### CSS/Tailwind

```jsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800">Title</h2>
</div>

// For complex styles, use custom CSS classes
// Define in index.css or component-specific CSS
```

### File Organization

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── services/        # Business logic
├── firebase/        # Firebase configuration
└── utils/           # Utility functions
```

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat(cart): add quantity increment/decrement buttons"
git commit -m "fix(checkout): resolve university delivery validation error"
git commit -m "docs(readme): update installation instructions"

# Bad commit messages (avoid these)
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "wip"
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Reference issue numbers when applicable
- Run security checks before committing

## 🔄 Pull Request Process

### 1. Before Creating PR

```bash
# Update your branch with latest main
git checkout main
git pull upstream main
git checkout your-branch
git rebase main

# Run security checks
./security-check.sh

# Run tests (if available)
npm test

# Build the project
cd frontend && npm run build
```

### 2. Create Pull Request

1. Push your branch to your fork
2. Go to the original repository on GitHub
3. Click "New Pull Request"
4. Select your branch
5. Fill out the PR template

### 3. PR Title Format

```
[Type] Brief description

Examples:
[Feature] Add payment gateway integration
[Fix] Resolve cart calculation bug
[Docs] Update API documentation
```

### 4. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested locally
- [ ] All tests passing
- [ ] Security checks passed

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

### 5. PR Review Process

- Address review comments promptly
- Keep discussions professional
- Be open to feedback and suggestions
- Update PR based on feedback

## 🧪 Testing

### Manual Testing

Before submitting PR, test:

1. **Core Functionality**
   - User authentication (OTP login)
   - Menu browsing and search
   - Add to cart functionality
   - Checkout process
   - Order placement
   - Order tracking

2. **Edge Cases**
   - Empty states
   - Error scenarios
   - Network failures
   - Invalid inputs

3. **Responsive Design**
   - Mobile devices (< 768px)
   - Tablets (768px - 1024px)
   - Desktop (> 1024px)

### Automated Tests (if available)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you've thought about

**Additional Context**
Mockups, examples, etc.
```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Project-Specific
- `README.md` - Project overview and setup
- `SECURITY.md` - Security guidelines
- `PRE_COMMIT_CHECKLIST.md` - Pre-commit checks
- `PRODUCTION_SETUP.md` - Production deployment guide

## 🎯 Good First Issues

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - Community help needed
- `documentation` - Documentation improvements

## 💬 Communication

- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions and discussions
- **Discussions** - General questions and ideas

## 🙏 Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Acknowledged in the community

## ❓ Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Create a new issue with the `question` label

---

**Thank you for contributing to Dabba! Your efforts help make home-style food delivery better for everyone.** 🍱❤️
