# 🔐 Where to Put Secret Keys - Security Guide

## 🎯 **The Golden Rule**

**Public Keys** → `.env` file ✅  
**Secret Keys** → Firebase Functions config ❌ NEVER in .env

---

## ✅ **Safe for .env File**

### **These are PUBLIC keys (safe to put in .env):**
```env
# Firebase - These are public identifiers
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# Razorpay - Only the public key
VITE_RAZORPAY_KEY_ID=rzp_test_...

# Algolia - Only the search key (not admin key)
VITE_ALGOLIA_SEARCH_KEY=search_only_key...

# Cloudinary - Public identifiers
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Why these are safe:** They're meant to be public and visible to users.

---

## ❌ **NEVER Put These in .env**

### **These are SECRET keys (use Firebase Functions config):**

#### **Razorpay Secret:**
```bash
# WRONG: Don't put in .env
RAZORPAY_KEY_SECRET=secret_key  # ❌ NEVER DO THIS

# RIGHT: Use Firebase Functions config
firebase functions:config:set razorpay.key_secret="your_secret_key"
```

#### **Email Passwords:**
```bash
# WRONG: Don't put in .env
EMAIL_PASSWORD=your_password  # ❌ NEVER DO THIS

# RIGHT: Use Firebase Functions config
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your_app_password"
```

#### **Database Admin Keys:**
```bash
# WRONG: Don't put in .env
FIREBASE_ADMIN_KEY=admin_key  # ❌ NEVER DO THIS

# RIGHT: Firebase Functions automatically have admin access
# No need to store admin keys manually
```

---

## 🔧 **How to Set Secret Keys**

### **Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

### **Step 2: Set Secret Configuration**
```bash
# Razorpay secrets
firebase functions:config:set razorpay.key_secret="your_razorpay_secret"
firebase functions:config:set razorpay.webhook_secret="your_webhook_secret"

# Email configuration
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your_gmail_app_password"

# Algolia admin key (for backend sync)
firebase functions:config:set algolia.admin_key="your_algolia_admin_key"
```

### **Step 3: Deploy Functions**
```bash
cd functions
npm install
firebase deploy --only functions
```

### **Step 4: Verify Configuration**
```bash
# Check what's configured
firebase functions:config:get

# Should show your secret keys (values hidden for security)
```

---

## 🧪 **How to Test Secret Keys**

### **Test in Firebase Functions Shell:**
```bash
# Start Firebase shell
firebase functions:shell

# Test accessing secrets
> const config = functions.config();
> console.log('Razorpay configured:', !!config.razorpay?.key_secret);
> console.log('Email configured:', !!config.email?.user);
```

### **Test in Production:**
```bash
# Check function logs
firebase functions:log

# Look for configuration errors
firebase functions:log --only createRazorpayOrder
```

---

## 🚨 **Security Warnings**

### **What Happens if You Put Secrets in .env:**
- ❌ **Exposed to Users**: Anyone can see them in browser
- ❌ **GitHub Security**: GitHub will detect and alert
- ❌ **Security Risk**: Keys can be stolen and misused
- ❌ **Compliance Issues**: Violates security best practices

### **Signs Your Secrets Are Exposed:**
- GitHub sends security alerts
- Razorpay dashboard shows unusual activity
- Email service reports unauthorized access
- Users can see keys in browser developer tools

---

## ✅ **Best Practices**

### **Environment File (.env):**
```env
# ✅ GOOD: Public identifiers only
VITE_FIREBASE_PROJECT_ID=my-project
VITE_RAZORPAY_KEY_ID=rzp_test_123

# ❌ BAD: Never put secrets here
# RAZORPAY_KEY_SECRET=secret_123  # DON'T DO THIS
# EMAIL_PASSWORD=password123      # DON'T DO THIS
```

### **Firebase Functions Config:**
```bash
# ✅ GOOD: Secrets in Firebase Functions
firebase functions:config:set service.secret="actual_secret_key"

# ✅ GOOD: Access in functions
const config = functions.config();
const secret = config.service.secret;
```

### **Production Deployment:**
```bash
# ✅ GOOD: Deploy with secrets
firebase deploy --only functions

# ✅ GOOD: Secrets are automatically available in production
# No need to manually configure in hosting platform
```

---

## 🎯 **Quick Reference**

### **Public Keys (Frontend - .env file):**
- Firebase API Key, Auth Domain, Project ID
- Razorpay Key ID (starts with rzp_test_ or rzp_live_)
- Algolia Search Key (not admin key)
- Cloudinary Cloud Name

### **Secret Keys (Backend - Firebase Functions):**
- Razorpay Key Secret
- Email passwords
- Algolia Admin Key
- Webhook secrets
- Database admin credentials

### **Commands to Remember:**
```bash
# Set secrets
firebase functions:config:set key.name="secret_value"

# Check secrets
firebase functions:config:get

# Deploy with secrets
firebase deploy --only functions
```

**Remember: When in doubt, if it says "secret" or "private" - use Firebase Functions config, not .env!** 🔐

---

*This guide ensures your application is secure and follows industry best practices for secret management.*