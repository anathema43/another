# 🏔️ Complete Integration Guide - Darjeeling Souls E-commerce

## 🎯 **Quick Start Overview**

This is your complete guide to setting up the Darjeeling Souls e-commerce platform. Follow these steps in order for a fully functional production-ready application.

**What You'll Build**: Enterprise-grade e-commerce platform with advanced search, cultural storytelling, secure payments, and real-time features.

---

## 🚀 **New to Development?**

**Start here first:** [Simple Setup Guide](SIMPLE_SETUP_GUIDE.md) - Gets you running in 15 minutes

**This guide is for:** Complete production setup with all integrations

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: Latest version
- **Modern Browser**: Chrome, Firefox, Safari, Edge

### **Required Service Accounts**
1. **Firebase**: [console.firebase.google.com](https://console.firebase.google.com)
2. **Razorpay**: [razorpay.com](https://razorpay.com)
3. **Algolia**: [algolia.com](https://algolia.com) (for advanced search)
4. **Cloudinary**: [cloudinary.com](https://cloudinary.com) (for image optimization)
5. **Netlify**: [netlify.com](https://netlify.com) (for deployment)

---

## 🚀 **Step 1: Project Setup**

### **Clone and Install**
```bash
# Clone the repository
git clone <your-repository-url>
cd darjeeling-souls

# Install dependencies
npm install

# Verify installation
npm list --depth=0

# Test build process
npm run build
```

### **⚠️ Important Security Note**

**Public Keys (Safe for .env):**
- `VITE_FIREBASE_API_KEY` ✅
- `VITE_RAZORPAY_KEY_ID` ✅ 
- `VITE_ALGOLIA_SEARCH_KEY` ✅

**Secret Keys (NEVER in .env):**
- Razorpay Key Secret ❌ (Use Firebase Functions config)
- Firebase Admin SDK ❌ (Use Firebase Functions)
- Email passwords ❌ (Use Firebase Functions config)

---

## 🔥 **Step 2: Firebase Configuration**

### **Create Firebase Project**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Create a project"
3. Project name: `darjeeling-souls-prod`
4. Disable Google Analytics (can add later)
5. Wait for project creation

### **Enable Services**

#### **Firestore Database**
1. Click "Firestore Database" → "Create database"
2. Select "Start in production mode"
3. Choose location: `asia-south1` (Mumbai)
4. Go to Rules tab and replace with content from `firestore.rules`
5. Click "Publish"

#### **Authentication**
1. Click "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Email/Password"
4. Enable "Google" (optional)

#### **Storage**
1. Click "Storage" → "Get started"
2. Use production mode
3. Choose same location as Firestore
4. Replace rules with content from `storage.rules`

### **Get Configuration**
1. Click Project Overview → Web icon (`</>`)
2. App nickname: `darjeeling-souls-web`
3. **Copy the firebaseConfig object** - you'll need this!

---

## 🔐 **Step 2.5: Secure Backend Setup**

### **Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

### **Set Secret Keys (NOT in .env):**
```bash
firebase functions:config:set razorpay.key_secret="your_razorpay_secret"
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-gmail-app-password"
```

## 💳 **Step 3: Razorpay Setup**

### **Create Account**
1. Go to [razorpay.com](https://razorpay.com) → Sign Up
2. Complete business verification
3. Verify email and phone

### **Get API Keys**
1. Dashboard → Settings → API Keys
2. Generate new keys
3. **Copy Key ID and Key Secret**
4. Start with test mode keys

### **Configure Webhooks**
1. Settings → Webhooks → Create new
2. URL: `https://your-region-your-project.cloudfunctions.net/razorpayWebhook`
3. Events: "payment.captured", "payment.failed"
4. **Save webhook secret**

---

## 🔍 **Step 4: Algolia Search Setup**

### **Create Account**
1. Go to [algolia.com](https://algolia.com) → Start free
2. Choose free "Build" plan
3. Complete verification

### **Setup Application**
1. Create Application: `darjeeling-souls-search`
2. Select closest region
3. Create index: `darjeeling_products`
4. Get API keys from Settings → API Keys:
   - Application ID
   - Search-Only API Key
   - Admin API Key

---

## 🖼️ **Step 5: Cloudinary Setup**

### **Create Account**
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Choose "Developer" account
3. Complete email verification

### **Get Configuration**
1. Dashboard → Account Details:
   - Cloud Name
   - API Key
   - API Secret (click "Reveal")

### **Create Upload Preset**
1. Settings → Upload → Add upload preset
2. Name: `darjeeling_products`
3. Signing Mode: "Unsigned"
4. Folder: `darjeeling/products`
5. Formats: `jpg,png,webp`
6. Enable "Auto quality" and "Auto format"

---

## 🔧 **Step 6: Environment Configuration**

### **Create .env File**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=darjeeling-souls-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darjeeling-souls-prod
VITE_FIREBASE_STORAGE_BUCKET=darjeeling-souls-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay (Public Key Only)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Algolia Search
VITE_ALGOLIA_APP_ID=your_application_id
VITE_ALGOLIA_SEARCH_KEY=your_search_only_key
VITE_ALGOLIA_INDEX_NAME=darjeeling_products

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=darjeeling_products
```

---

## 🧪 **Step 7: Firebase Functions Setup**

### **Install Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

### **Configure Functions**
```bash
cd functions
npm install

# Set secret environment variables (NEVER put these in .env)
firebase functions:config:set razorpay.key_secret="your_razorpay_secret"
firebase functions:config:set razorpay.webhook_secret="your_webhook_secret"
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set algolia.admin_key="your_algolia_admin_key"

# Deploy functions
firebase deploy --only functions
```

---

## 🚀 **Step 8: Initial Testing**

### **Start Development**
```bash
npm run dev
# Should open at http://localhost:5173
```

### **Create Admin Account**
1. Sign up for account in your app
2. Go to Firebase Console → Authentication → Users
3. Copy your user UID
4. Go to Firestore → users collection
5. Find your user document
6. Add field: `role` with value `admin`

### **Seed Data**
1. Access `/admin` in your app
2. Click "Seed Products" button
3. Click "Seed Artisan Profiles" button
4. Go to Settings tab → "Sync Products to Algolia"

---

## 🌐 **Step 9: Production Deployment**

### **Netlify Deployment**
1. Push code to GitHub
2. Connect GitHub to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add all `VITE_*` environment variables
5. Deploy

### **Domain Setup**
1. Add custom domain in Netlify
2. Configure DNS settings
3. Enable HTTPS (automatic)

---

## 🧪 **Step 10: Testing & Validation**

### **Run Test Suite**
```bash
# Unit tests
npm run test

# E2E tests
npm run cy:run

# Security tests
npm run cy:run:security

# All tests
npm run test:all
```

### **Production Testing**
1. Test user registration/login
2. Test product browsing and search
3. Test cart functionality
4. Test payment processing (with test cards)
5. Test admin panel access
6. Test email notifications

---

## 🔧 **Development Commands**

### **Daily Development**
```bash
npm run dev              # Start development server
npm run test:watch       # Run tests in watch mode
npm run lint             # Check code quality
```

### **Testing**
```bash
npm run test             # Unit tests
npm run cy:open          # Interactive E2E tests
npm run cy:run:critical  # Critical user journey tests
npm run test:all         # Complete test suite
```

### **Deployment**
```bash
npm run build            # Build for production
npm run preview          # Preview production build
firebase deploy          # Deploy Firebase Functions
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **"Firebase not configured"**
- Check `.env` file has all Firebase variables
- Restart dev server: `npm run dev`
- Verify no typos in variable names

#### **"Razorpay not loading"**
- Check `VITE_RAZORPAY_KEY_ID` in `.env`
- Verify key format starts with `rzp_test_` or `rzp_live_`

#### **"Search not working"**
- Verify Algolia keys in `.env`
- Check if products are synced to Algolia index
- Test search in Algolia dashboard

#### **"Images not uploading"**
- Check Cloudinary configuration
- Verify upload preset is "unsigned"
- Check file size limits (5MB max)

### **Debug Commands**
```bash
# Check Firebase connection
firebase projects:list

# View function logs
firebase functions:log

# Test build locally
npm run build && npm run preview
```

---

## 📚 **Additional Resources**

### **Detailed Guides**
- **Testing**: See `TESTING.md` for comprehensive testing strategy
- **Architecture**: See `ARCHITECTURE.md` for technical details
- **CI/CD**: See `CI_CD_SETUP_GUIDE.md` for automated deployment
- **Email**: See `EMAIL_SETUP_GUIDE.md` for email configuration
- **Payments**: See `RAZORPAY_DEPLOYMENT_GUIDE.md` for payment setup
- **Validation**: See `VALIDATION_GUIDE.md` for quality assurance
- **Logo**: See `LOGO_UPDATE_GUIDE.md` for logo management

### **Service Documentation**
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Razorpay**: [razorpay.com/docs](https://razorpay.com/docs)
- **Algolia**: [algolia.com/doc](https://algolia.com/doc)
- **Cloudinary**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

---

## 🎯 **Success Criteria**

Your setup is complete when:
- ✅ App runs without errors locally
- ✅ User registration/login works
- ✅ Products display from Firebase
- ✅ Search functionality works
- ✅ Cart persists across sessions
- ✅ Admin panel accessible
- ✅ Payment processing works (test mode)
- ✅ Images upload and optimize
- ✅ Email notifications send
- ✅ Production deployment successful

**Your Darjeeling Souls e-commerce platform will be production-ready!** 🏔️