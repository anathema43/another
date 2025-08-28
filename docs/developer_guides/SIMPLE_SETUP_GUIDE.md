# 🏔️ Simple Setup Guide - Darjeeling Souls

## 🎯 **What You're Building**
A complete online store for authentic Darjeeling products with:
- Customer shopping and checkout
- Admin panel to manage products and orders
- Secure payments with Razorpay
- Email notifications for orders

---

## 📋 **What You Need Before Starting**

### **On Your Computer:**
- **Node.js** (version 18 or newer) - [Download here](https://nodejs.org)
- **Git** - [Download here](https://git-scm.com)
- **Code Editor** - VS Code recommended

### **Online Accounts (All Free to Start):**
1. **Firebase** - For database and user accounts
2. **Razorpay** - For payments (Indian customers)
3. **Netlify** - For hosting your website

---

## 🚀 **Step 1: Get the Code Running**

### **Download and Install:**
```bash
# 1. Download the project
git clone <your-repository-url>
cd darjeeling-souls

# 2. Install everything needed
npm install

# 3. Start the website
npm run dev
```

**Expected Result:** Website opens at `http://localhost:5173`

---

## 🔥 **Step 2: Set Up Firebase (Database)**

### **Create Firebase Project:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it: `darjeeling-souls`
4. Disable Google Analytics for now
5. Click "Create project"

### **Enable Database:**
1. Click "Firestore Database" → "Create database"
2. Choose "Start in production mode"
3. Select location: "asia-south1 (Mumbai)"
4. Click "Done"

### **Set Up Security Rules:**
1. Go to "Rules" tab in Firestore
2. Replace everything with this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by all, writable by admins only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders are readable/writable by owner, readable by admins
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Carts and wishlists - users can only access their own
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /wishlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click "Publish"

### **Enable User Accounts:**
1. Click "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Click "Email/Password" → "Enable" → "Save"

### **Get Your Firebase Keys:**
1. Click the gear icon → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. App nickname: `darjeeling-souls-web`
5. **Copy the config object** - you'll need this!

---

## 🔧 **Step 3: Create Environment File**

### **Create .env File:**
Create a file called `.env` in your project root:

```env
# Firebase Configuration (from step 2)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=darjeeling-souls.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darjeeling-souls
VITE_FIREBASE_STORAGE_BUCKET=darjeeling-souls.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay (we'll set this up next)
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder

# Other services (optional for now)
VITE_ALGOLIA_APP_ID=placeholder
VITE_ALGOLIA_SEARCH_KEY=placeholder
VITE_CLOUDINARY_CLOUD_NAME=placeholder
```

**⚠️ IMPORTANT:** Never put secret keys in .env! Only put public keys here.

---

## 💳 **Step 4: Set Up Payments (Razorpay)**

### **Create Razorpay Account:**
1. Go to [razorpay.com](https://razorpay.com)
2. Click "Sign Up"
3. Complete business registration
4. Verify email and phone

### **Get Test Keys:**
1. Go to "Settings" → "API Keys"
2. Copy the "Key Id" (starts with `rzp_test_`)
3. **Only put the Key Id in your .env file**
4. **Never put the Key Secret in .env!**

### **Update .env:**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
```

### **Set Up Backend (Where Secret Keys Go):**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set secret keys (NOT in .env!)
firebase functions:config:set razorpay.key_secret="your_razorpay_secret_key"
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-gmail-app-password"

# Deploy backend functions
cd functions
npm install
firebase deploy --only functions
```

---

## 🧪 **Step 5: Test Everything**

### **Create Admin Account:**
1. Sign up for an account on your website
2. Go to Firebase Console → Authentication → Users
3. Copy your user UID
4. Go to Firestore → users collection → your user document
5. Add field: `role` with value `admin`
6. Save

### **Add Sample Data:**
1. Login with admin account
2. Go to `/admin`
3. Click "Seed Products" button
4. Click "Seed Artisan Profiles" button

### **Test User Journey:**
1. Browse products on `/shop`
2. Add items to cart
3. Create user account
4. Complete checkout
5. Check admin panel for orders

---

## 🌐 **Step 6: Deploy to Internet**

### **Deploy to Netlify:**
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add all your `VITE_*` environment variables
6. Deploy!

---

## 🆘 **Common Problems & Solutions**

### **"Firebase not configured"**
- Check your `.env` file has all Firebase variables
- Restart: `npm run dev`

### **"Razorpay not loading"**
- Check `VITE_RAZORPAY_KEY_ID` in `.env`
- Make sure it starts with `rzp_test_`

### **"Can't access admin panel"**
- Make sure you added `role: admin` to your user in Firestore
- Check you're logged in with the right account

### **"Products not showing"**
- Click "Seed Products" in admin panel
- Check Firebase console for data

---

## 📞 **Need Help?**

### **Check These First:**
1. Browser console for error messages
2. Firebase console for data
3. Network tab for failed requests

### **Common Commands:**
```bash
npm run dev          # Start development
npm run build        # Build for production
npm run test         # Run tests
firebase login       # Login to Firebase
firebase deploy      # Deploy backend
```

**This guide gets you from zero to working e-commerce store in about 2-3 hours!** 🏔️

---

## 📝 **Content Management (No Coding Required!)**

### **Edit Any Page Content:**
1. **Login as admin**
2. **Visit any page** (About, Contact, Policies)
3. **Look for pencil icon** in top-right corner
4. **Click and edit** in simple form
5. **Save changes** - goes live immediately!

### **Create Weekly Stories:**
1. **Go to Admin Panel** (`/admin`)
2. **Click "Stories" tab**
3. **Click "Create New Story"**
4. **Write about your artisans** and their food-making process
5. **Upload images** and publish

**Perfect for showcasing your food artisans and building customer trust!** 📖