# 💻 Local Development Setup Guide

## 🎯 **Quick Start (15 minutes)**

This guide gets your development environment running quickly for daily coding work.

---

## 📋 **Prerequisites Check**

### **Verify You Have:**
```bash
# Check Node.js (need version 18+)
node --version

# Check npm
npm --version

# Check Git
git --version
```

**If missing any:** Download from [nodejs.org](https://nodejs.org) and [git-scm.com](https://git-scm.com)

---

## 🚀 **Quick Setup**

### **1. Get the Code:**
```bash
# Clone repository
git clone <your-repo-url>
cd darjeeling-souls

# Install dependencies
npm install
```

### **2. Environment Setup:**
Create `.env` file in project root:
```env
# Firebase (get from Firebase console)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay (public key only)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key

# Optional services
VITE_ALGOLIA_APP_ID=placeholder
VITE_CLOUDINARY_CLOUD_NAME=placeholder
```

### **3. Start Development:**
```bash
# Start the website
npm run dev

# Opens at: http://localhost:5173
```

---

## 🔧 **Daily Development Commands**

### **Essential Commands:**
```bash
# Start development server
npm run dev

# Run tests while coding
npm run test:watch

# Check code quality
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Firebase Commands:**
```bash
# Login to Firebase
firebase login

# Start Firebase emulator (for backend testing)
firebase emulators:start

# Deploy backend functions
firebase deploy --only functions

# View function logs
firebase functions:log
```

---

## 🗂️ **Project Structure**

### **Key Folders:**
```
src/
├── components/          # Reusable UI components
├── pages/              # Main pages (Home, Shop, Admin, etc.)
├── store/              # State management (Zustand stores)
├── services/           # Business logic and API calls
├── utils/              # Helper functions
├── firebase/           # Firebase configuration
└── assets/             # Images, icons, etc.

docs/                   # All documentation
functions/              # Firebase Functions (backend)
cypress/                # End-to-end tests
```

### **Important Files:**
- `src/App.jsx` - Main app component with routing
- `src/firebase/firebase.js` - Firebase configuration
- `src/store/authStore.js` - User authentication
- `src/store/cartStore.js` - Shopping cart
- `src/pages/Admin.jsx` - Admin panel

---

## 🧪 **Testing During Development**

### **Run Tests:**
```bash
# Unit tests (fast)
npm run test

# E2E tests (slower, but comprehensive)
npm run cy:open

# Test specific features
npm run cy:run:search      # Search functionality
npm run cy:run:security    # Security tests
```

### **Debug Tests:**
```bash
# Run tests in watch mode
npm run test:watch

# Debug specific test
npm run test -- --reporter=verbose src/store/cartStore.test.js
```

---

## 🔍 **Debugging Common Issues**

### **Website Won't Start:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Firebase Errors:**
```bash
# Check Firebase connection
firebase projects:list

# Check if logged in
firebase login --reauth
```

### **Environment Variable Issues:**
```bash
# Check if .env file exists
ls -la .env

# Check variables are loaded
node -e "console.log(process.env.VITE_FIREBASE_API_KEY)"
```

### **Build Errors:**
```bash
# Clean build
rm -rf dist
npm run build

# Check for TypeScript errors
npm run type-check
```

---

## 🔄 **Git Workflow**

### **Daily Git Commands:**
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Add new feature"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### **Feature Development:**
```bash
# Create new feature branch
git checkout -b feature/new-feature

# Work on feature...
git add .
git commit -m "Implement new feature"

# Push feature branch
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## 📱 **Mobile Development Testing**

### **Test on Different Devices:**
```bash
# Start dev server
npm run dev

# Open in browser and test:
# - Chrome DevTools mobile view
# - Different screen sizes
# - Touch interactions
```

### **Mobile-Specific Testing:**
- Test navigation menu on mobile
- Verify cart and wishlist work on touch devices
- Check checkout flow on mobile
- Test image loading on slower connections

---

## 🎯 **Development Workflow**

### **Typical Day:**
1. **Start:** `npm run dev`
2. **Code:** Make changes to files
3. **Test:** `npm run test:watch` (runs automatically)
4. **Check:** Browser auto-refreshes with changes
5. **Commit:** `git add . && git commit -m "Description"`
6. **Push:** `git push origin main`

### **Before Deploying:**
```bash
# Run full test suite
npm run test:all

# Build and test production version
npm run build
npm run preview

# Deploy when ready
```

---

## 🆘 **Getting Help**

### **Check These When Stuck:**
1. **Browser Console** - Press F12, look for red errors
2. **Terminal Output** - Check for error messages
3. **Firebase Console** - Check if data is saving
4. **Network Tab** - See if API calls are failing

### **Common Error Solutions:**
- **"Module not found"** → Run `npm install`
- **"Firebase not configured"** → Check `.env` file
- **"Permission denied"** → Check Firebase rules
- **"Build failed"** → Check for syntax errors

---

## 🎉 **Success Checklist**

### **Your Setup is Working When:**
- [ ] Website loads at localhost:5173
- [ ] You can create user accounts
- [ ] Products display on shop page
- [ ] Cart functionality works
- [ ] Admin panel is accessible (after setting admin role)
- [ ] Tests pass: `npm run test`

**Once these work, you're ready to develop and deploy!** 🚀

---

*This guide focuses on getting you productive quickly. For advanced features, see the other guides in this folder.*