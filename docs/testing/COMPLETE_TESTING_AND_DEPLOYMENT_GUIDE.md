# 🧪 Complete Testing & Deployment Guide - Darjeeling Souls

## 🎯 **Overview**

This comprehensive guide takes you from local testing to production deployment, including how to handle payment integration separately. Perfect for when you're ready to go live but need to manage Razorpay integration in phases.

**Timeline**: 2-3 hours for complete testing and deployment  
**Result**: Live e-commerce platform ready for customers  

---

## 📋 **Prerequisites Checklist**

### **✅ Before You Start:**
- [ ] Development version working locally (`npm run dev`)
- [ ] All environment variables configured in `.env`
- [ ] Firebase project created and configured
- [ ] Netlify account created
- [ ] GitHub repository with your code

### **✅ Required Service Accounts:**
- [ ] **Firebase**: Project created and services enabled
- [ ] **Netlify**: Account created for hosting
- [ ] **Razorpay**: Account created (can use test keys initially)
- [ ] **Algolia**: Account created (optional but recommended)
- [ ] **Cloudinary**: Account created (optional but recommended)

---

## 🧪 **Section 1: End-to-End Test Plan (Without Payments)**

### **Step 1: Environment Setup**
```bash
# 1. Start your development server
npm run dev
# Should open at http://localhost:5173

# 2. Verify no console errors
# Open browser DevTools (F12) and check Console tab
# Should see "✅ Firebase connected successfully" or similar
```

### **Step 2: Database Seeding (First Time Setup)**
```bash
# Navigate to admin panel
# URL: http://localhost:5173/#/admin

# If you see "Access Denied":
# 1. Sign up for an account first
# 2. Go to Firebase Console → Authentication → Users
# 3. Copy your user UID
# 4. Go to Firestore → users collection → your user document
# 5. Add field: role = "admin"
# 6. Refresh the page

# Once in admin panel:
# 1. Click "Seed Products" button
# 2. Click "Seed Artisan Profiles" button
# 3. Go to Settings tab → "Sync Products to Algolia" (if configured)
```

### **Step 3: Complete User Journey Test**

#### **3.1 Product Browsing Test**
```bash
# Navigate to shop page
URL: http://localhost:5173/#/shop

✅ Verify:
- [ ] Products display correctly with images
- [ ] Product cards show name, price, description
- [ ] "Add to Cart" buttons are visible
- [ ] Search functionality works (if Algolia configured)
- [ ] Category filtering works
- [ ] No JavaScript errors in console
```

#### **3.2 Shopping Cart Test**
```bash
# Add products to cart
1. Click "Add to Cart" on any product
2. Verify cart count increases in navbar
3. Add multiple products
4. Navigate to cart page: http://localhost:5173/#/cart

✅ Verify:
- [ ] All added products appear in cart
- [ ] Quantity controls work (+ and - buttons)
- [ ] Total price calculates correctly
- [ ] "Remove" buttons work
- [ ] Cart persists after page refresh
- [ ] Cart shows correct item count in navbar
```

#### **3.3 User Account Test**
```bash
# Test user registration
1. Navigate to: http://localhost:5173/#/signup
2. Fill out registration form with test data:
   - Name: "Test Customer"
   - Email: "test@example.com"
   - Password: "testpassword123"
3. Submit form

✅ Verify:
- [ ] Registration completes without errors
- [ ] User is automatically logged in
- [ ] Navbar shows user account icon
- [ ] Can access account page: http://localhost:5173/#/account

# Test login/logout
4. Click "Sign Out" in navbar
5. Navigate to: http://localhost:5173/#/login
6. Login with same credentials

✅ Verify:
- [ ] Login works correctly
- [ ] User is redirected appropriately
- [ ] Cart contents are preserved after login
```

#### **3.4 Checkout Process Test**
```bash
# Test checkout flow
1. Ensure you have items in cart
2. Navigate to: http://localhost:5173/#/checkout
3. Fill out shipping information:
   - First Name: "Test"
   - Last Name: "Customer"
   - Email: "test@example.com"
   - Phone: "+91 9876543210"
   - Address: "123 Test Street"
   - City: "Mumbai"
   - State: "Maharashtra"
   - ZIP: "400001"
   - Country: "India"

✅ Verify:
- [ ] All form fields accept input
- [ ] Form validation works (try submitting empty fields)
- [ ] Order summary displays correctly
- [ ] Total calculations are accurate (subtotal + tax + shipping)
- [ ] Payment method selection works
```

#### **3.5 Final Verification Point**
```bash
# The test is successful when:
✅ You reach the payment screen without errors
✅ Order summary shows correct items and totals
✅ Razorpay payment interface loads (or shows placeholder if not configured)
✅ No JavaScript errors in browser console
✅ All form data is properly captured

# At this point, DO NOT complete the payment
# This confirms your entire flow works up to payment processing
```

### **Step 4: Content Management Test**
```bash
# Test artisan and story content
1. Navigate to: http://localhost:5173/#/artisans
2. Verify artisan profiles display
3. Click on an artisan to view full profile
4. Navigate to: http://localhost:5173/#/stories
5. Verify stories display (if any exist)

✅ Verify:
- [ ] Artisan directory loads
- [ ] Individual artisan profiles work
- [ ] Stories page loads without errors
- [ ] Navigation between pages works
```

### **Step 5: Admin Panel Test**
```bash
# Test admin functionality
1. Navigate to: http://localhost:5173/#/admin
2. Test product management:
   - Click "Add Product" and create a test product
   - Edit an existing product
   - Verify changes appear immediately
3. Test order management (if you have test orders)

✅ Verify:
- [ ] Admin panel loads correctly
- [ ] Product CRUD operations work
- [ ] File upload works (if configured)
- [ ] No permission errors
```

---

## 🌐 **Section 2: Initial Deployment (Avoiding Razorpay)**

### **Step 1: Prepare for Deployment**
```bash
# 1. Test production build locally
npm run build
npm run preview
# Should open at http://localhost:4173

# 2. Verify build works without errors
# Check that all pages load correctly in preview mode
```

### **Step 2: Configure Netlify Environment Variables**

#### **Set Placeholder for Razorpay:**
```env
# In Netlify Dashboard → Site settings → Environment variables:

# Firebase Configuration (use your real values)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay (use placeholder initially)
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder

# Optional services (use placeholders)
VITE_ALGOLIA_APP_ID=placeholder
VITE_ALGOLIA_SEARCH_KEY=placeholder
VITE_CLOUDINARY_CLOUD_NAME=placeholder
```

#### **Why This Works:**
- The application will load and function normally
- Users can browse, add to cart, and reach checkout
- Payment section will show "Payment configuration pending" message
- No errors or crashes occur

### **Step 3: Deploy to Netlify**

#### **Option A: GitHub Integration (Recommended)**
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Ready for initial deployment"
git push origin main

# 2. In Netlify Dashboard:
# - Click "New site from Git"
# - Choose GitHub and authorize
# - Select your repository
# - Build settings:
#   Build command: npm run build
#   Publish directory: dist
# - Add environment variables (from Step 2)
# - Deploy site
```

#### **Option B: Manual Deploy**
```bash
# 1. Build the project
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Login and deploy
netlify login
netlify deploy --prod --dir=dist
```

### **Step 4: Test Deployed Site**
```bash
# Visit your Netlify URL (e.g., https://amazing-name-123456.netlify.app)

✅ Test the same user journey as local:
- [ ] Site loads without errors
- [ ] Products display correctly
- [ ] User registration/login works
- [ ] Cart functionality works
- [ ] Checkout process works up to payment screen
- [ ] Payment screen shows appropriate message about configuration

# This confirms your site is production-ready except for payment processing
```

---

## 🔄 **Section 3: Switching from Test to Production**

### **Understanding Test vs Production Environment**

#### **Test Environment:**
- Uses Razorpay test API keys (start with `rzp_test_`)
- Processes fake payments that don't charge real money
- Perfect for testing complete payment flow
- Test cards: 4111111111111111 (success), 4000000000000002 (failure)

#### **Production Environment:**
- Uses Razorpay live API keys (start with `rzp_live_`)
- Processes real payments with real money
- Requires completed business verification
- Only switch when ready for real customers

### **Criteria for Going Live**

#### **✅ Ready to Switch When:**
- [ ] Razorpay account is fully verified and approved
- [ ] You have received live API keys from Razorpay
- [ ] You've tested the complete flow with test keys
- [ ] You're ready to accept real customer orders
- [ ] Customer service processes are in place
- [ ] You have inventory ready to ship

#### **⚠️ Don't Switch If:**
- [ ] Still testing the application
- [ ] Razorpay account verification is pending
- [ ] You don't have inventory or fulfillment ready
- [ ] Customer service processes aren't established

### **Step-by-Step "Go Live" Process**

#### **Phase 1: Update Frontend (Netlify)**
```bash
# 1. Get your live Razorpay Key ID from Razorpay Dashboard
# Go to: https://dashboard.razorpay.com/app/keys
# Copy the "Key Id" that starts with "rzp_live_"

# 2. Update Netlify Environment Variables
# Go to: Netlify Dashboard → Your Site → Site settings → Environment variables
# Find: VITE_RAZORPAY_KEY_ID
# Update value to: rzp_live_your_actual_live_key_id

# 3. Trigger Netlify Redeploy
# In Netlify Dashboard → Deploys → Trigger deploy → Deploy site
# Wait for deployment to complete (usually 2-3 minutes)
```

#### **Phase 2: Update Backend (Firebase Functions)**
```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools
firebase login

# 2. Update Firebase Functions Configuration
firebase functions:config:set razorpay.key_id="rzp_live_your_live_key_id"
firebase functions:config:set razorpay.key_secret="your_live_key_secret"

# 3. Verify Configuration
firebase functions:config:get
# Should show your updated Razorpay configuration

# 4. Deploy Updated Functions
cd functions
npm install
firebase deploy --only functions

# 5. Verify Deployment
firebase functions:log
# Check for any deployment errors
```

#### **Phase 3: Update Webhook URL (Critical)**
```bash
# 1. Go to Razorpay Dashboard → Settings → Webhooks
# 2. Update webhook URL to your production domain:
#    https://your-region-your-project.cloudfunctions.net/razorpayWebhook
# 3. Ensure events are selected: payment.captured, payment.failed
# 4. Save webhook configuration
```

#### **Phase 4: Production Testing**
```bash
# ⚠️ IMPORTANT: Test with small amounts first (₹10-50)

# 1. Visit your live site
# 2. Complete a real purchase with a small amount
# 3. Use your real debit/credit card
# 4. Verify order appears in admin panel
# 5. Check email notifications are sent
# 6. Confirm payment appears in Razorpay dashboard

✅ Success Criteria:
- [ ] Real payment processes successfully
- [ ] Order is created in your database
- [ ] Customer receives order confirmation email
- [ ] Payment appears in Razorpay dashboard
- [ ] Admin can see order in admin panel
```

### **Production Testing Commands**
```bash
# Monitor Firebase Functions logs during testing
firebase functions:log --only createRazorpayOrder

# Check for any errors during payment processing
firebase functions:log --only verifyRazorpayPayment

# Monitor webhook processing
firebase functions:log --only razorpayWebhook
```

### **Rollback Plan (If Issues Occur)**
```bash
# If production payment fails, quickly rollback:

# 1. Revert Netlify environment variable
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key

# 2. Revert Firebase Functions config
firebase functions:config:set razorpay.key_id="rzp_test_your_test_key"
firebase functions:config:set razorpay.key_secret="your_test_secret"

# 3. Redeploy functions
firebase deploy --only functions

# 4. Update webhook URL back to test mode
# This gives you time to debug issues without affecting customers
```

---

## 🎯 **Success Criteria Summary**

### **Local Testing Success:**
- ✅ All pages load without JavaScript errors
- ✅ User can register, login, and logout
- ✅ Products display from Firebase database
- ✅ Cart functionality works with real-time sync
- ✅ Checkout process completes up to payment screen
- ✅ Admin panel accessible and functional

### **Initial Deployment Success:**
- ✅ Site loads at Netlify URL without errors
- ✅ All functionality works same as local
- ✅ Firebase integration works in production
- ✅ Users can complete entire flow except payment
- ✅ Admin panel works in production environment

### **Production Payment Success:**
- ✅ Real payments process successfully
- ✅ Orders are created in database
- ✅ Email notifications are sent
- ✅ Payments appear in Razorpay dashboard
- ✅ Admin can manage orders
- ✅ Customers receive confirmations

---

## 🚀 **Quick Reference Commands**

### **Testing Commands:**
```bash
# Start development
npm run dev

# Run automated tests
npm run cy:run:critical

# Build and preview
npm run build && npm run preview

# Check for errors
npm run lint
```

### **Deployment Commands:**
```bash
# Deploy to Netlify (if using CLI)
netlify deploy --prod --dir=dist

# Deploy Firebase Functions
firebase deploy --only functions

# Check deployment status
netlify status
firebase functions:log
```

### **Environment Management:**
```bash
# Netlify environment variables
netlify env:list
netlify env:set KEY value

# Firebase Functions configuration
firebase functions:config:set key.name="value"
firebase functions:config:get
```

### **Monitoring Commands:**
```bash
# Check Firebase logs
firebase functions:log --only functionName

# Check Netlify logs
netlify logs

# Test site performance
lighthouse https://your-site.netlify.app
```

---

## 🆘 **Troubleshooting Common Issues**

### **Local Testing Issues**

#### **"Firebase not configured"**
```bash
# Check environment variables
cat .env | grep FIREBASE

# Verify Firebase config
node -e "
const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
};
console.log('Config valid:', Object.values(config).every(v => v && !v.includes('undefined')));
"

# Solution: Check .env file has all Firebase variables
```

#### **"Products not loading"**
```bash
# Check Firestore connection
# Go to Firebase Console → Firestore → Data tab
# Verify products collection exists with data

# Check browser console for errors
# Look for authentication or permission errors

# Solution: Verify Firestore rules allow reading products
```

#### **"Admin panel access denied"**
```bash
# Check user role in Firestore
# Go to Firebase Console → Firestore → users collection
# Find your user document and verify role = "admin"

# Solution: Add admin role to your user document
```

### **Deployment Issues**

#### **"Netlify build failing"**
```bash
# Check build logs in Netlify dashboard
# Common issues:
# 1. Missing environment variables
# 2. Build command incorrect
# 3. Node.js version mismatch

# Solutions:
# 1. Add all VITE_* environment variables
# 2. Verify build command: npm run build
# 3. Set NODE_VERSION = 18 in environment variables
```

#### **"Environment variables not working"**
```bash
# Netlify environment variables:
# 1. Must start with VITE_ for frontend access
# 2. Redeploy after adding variables
# 3. Check variable names for typos

# Firebase Functions environment:
# 1. Use firebase functions:config:set
# 2. Redeploy functions after changes
# 3. Check with firebase functions:config:get
```

### **Payment Integration Issues**

#### **"Razorpay not loading"**
```bash
# Check environment variable
echo $VITE_RAZORPAY_KEY_ID

# Verify key format
# Test keys start with: rzp_test_
# Live keys start with: rzp_live_

# Check browser console for Razorpay script errors
# Look for CSP (Content Security Policy) issues
```

#### **"Payment verification failing"**
```bash
# Check Firebase Functions logs
firebase functions:log --only verifyRazorpayPayment

# Common issues:
# 1. Webhook URL not updated
# 2. Key secret mismatch
# 3. Signature verification failing

# Solutions:
# 1. Update webhook URL in Razorpay dashboard
# 2. Verify key_secret in Firebase config
# 3. Check webhook signature validation
```

---

## 📊 **Deployment Timeline**

### **Day 1: Local Testing (2-3 hours)**
- Complete end-to-end testing
- Fix any issues found
- Verify all functionality works

### **Day 2: Initial Deployment (1-2 hours)**
- Deploy to Netlify with placeholder Razorpay
- Test deployed site functionality
- Verify Firebase integration works

### **Day 3: Payment Integration (2-3 hours)**
- Complete Razorpay account verification
- Switch to live API keys
- Test real payment processing
- Monitor for issues

### **Day 4: Go Live**
- Announce launch to customers
- Monitor site performance
- Respond to customer inquiries
- Track orders and payments

---

## 🎉 **Launch Checklist**

### **Technical Readiness:**
- [ ] All tests pass locally
- [ ] Site deployed successfully to Netlify
- [ ] Firebase integration working in production
- [ ] Payment processing tested and verified
- [ ] Email notifications working
- [ ] Admin panel accessible and functional

### **Business Readiness:**
- [ ] Initial inventory stocked and ready
- [ ] Pricing strategy finalized
- [ ] Customer service processes documented
- [ ] Legal compliance verified (terms, privacy)
- [ ] Marketing materials prepared
- [ ] Analytics and tracking configured

### **Operational Readiness:**
- [ ] Order fulfillment process tested
- [ ] Shipping partnerships established
- [ ] Return/refund policies documented
- [ ] Customer support team trained
- [ ] Backup and recovery procedures tested

**Your Darjeeling Souls e-commerce platform will be live and ready for customers!** 🏔️

---

## 📞 **Support Resources**

### **Technical Support:**
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **Netlify Dashboard**: [app.netlify.com](https://app.netlify.com)
- **Razorpay Dashboard**: [dashboard.razorpay.com](https://dashboard.razorpay.com)

### **Documentation:**
- **Setup Guide**: `docs/developer_guides/SIMPLE_SETUP_GUIDE.md`
- **Admin Guide**: `docs/user_guides/ADMIN_GUIDE.md`
- **Architecture**: `docs/developer_guides/ARCHITECTURE.md`

### **Emergency Contacts:**
- **Firebase Support**: Firebase Console → Support
- **Netlify Support**: Netlify Dashboard → Support
- **Razorpay Support**: support@razorpay.com

---

*This guide ensures a smooth transition from development to production with comprehensive testing and phased payment integration.*