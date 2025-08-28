# 💳 Razorpay Backend Deployment Guide

## 🎯 **Complete Payment Processing Setup**

This guide covers deploying the complete Razorpay backend integration using Firebase Functions for secure payment processing.

---

## 📋 **Prerequisites**

### **Required Accounts**:
1. **Razorpay Account**: [razorpay.com](https://razorpay.com)
2. **Firebase Project**: With Functions enabled
3. **Gmail Account**: For email notifications (or SendGrid)

### **Required Tools**:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install dependencies
cd functions
npm install
```

---

## 🔧 **Step 1: Razorpay Account Setup**

### **Create Razorpay Account**
1. Go to [razorpay.com](https://razorpay.com)
2. Click "Sign Up" and complete registration
3. Complete business verification (required for live payments)
4. Verify email and phone number

### **Get API Keys**
1. Login to Razorpay Dashboard
2. Go to "Settings" → "API Keys"
3. Generate new API keys
4. **Copy both Key ID and Key Secret**
5. For testing: Use test mode keys initially

### **Configure Webhooks**
1. Go to "Settings" → "Webhooks"
2. Create new webhook
3. URL: `https://your-region-your-project.cloudfunctions.net/razorpayWebhook`
4. Events: Select "payment.captured", "payment.failed", "order.paid"
5. Save webhook secret for configuration

---

## 🔥 **Step 2: Firebase Functions Configuration**

### **Set Environment Variables**
```bash
# Set Razorpay configuration
firebase functions:config:set razorpay.key_id="rzp_test_your_key_id"
firebase functions:config:set razorpay.key_secret="your_razorpay_key_secret"
firebase functions:config:set razorpay.webhook_secret="your_webhook_secret"

# Set email configuration (for notifications)
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-gmail-app-password"

# Verify configuration
firebase functions:config:get
```

### **Deploy Functions**
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:createRazorpayOrder,functions:verifyRazorpayPayment,functions:razorpayWebhook

# Check deployment logs
firebase functions:log
```

---

## 🧪 **Step 3: Testing Payment Integration**

### **Local Testing with Emulator**
```bash
# Start Firebase emulator
firebase emulators:start --only functions

# Test functions locally
firebase functions:shell
```

### **Test Payment Flow**
1. **Create Test Order**:
   ```javascript
   // In Firebase Functions shell
   createRazorpayOrder({
     amount: 299,
     currency: 'INR',
     receipt: 'test_order_123'
   })
   ```

2. **Test Payment Verification**:
   ```javascript
   verifyRazorpayPayment({
     razorpay_order_id: 'order_test_123',
     razorpay_payment_id: 'pay_test_123',
     razorpay_signature: 'test_signature',
     orderData: { /* test order data */ }
   })
   ```

### **Frontend Integration Testing**
```bash
# Start your app
npm run dev

# Test complete payment flow:
# 1. Add products to cart
# 2. Proceed to checkout
# 3. Fill shipping information
# 4. Select Razorpay payment
# 5. Use test card: 4111111111111111
# 6. Verify order creation
```

---

## 🔒 **Step 4: Security Validation**

### **Payment Security Checklist**
- [ ] **API Keys Secure**: Never exposed in frontend code
- [ ] **Signature Verification**: All payments cryptographically verified
- [ ] **Webhook Security**: Webhook signatures validated
- [ ] **Amount Validation**: Server-side amount verification
- [ ] **User Authentication**: Only authenticated users can create orders

### **Security Testing**
```javascript
// Test payment security
const testPaymentSecurity = () => {
  // Verify API keys are not exposed
  cy.window().then((win) => {
    const pageSource = win.document.documentElement.outerHTML;
    expect(pageSource).to.not.include('rzp_live_');
    expect(pageSource).to.not.include('key_secret');
  });
  
  // Test signature verification
  cy.intercept('POST', '**/verifyRazorpayPayment', (req) => {
    expect(req.body).to.have.property('razorpay_signature');
    req.continue();
  });
};
```

---

## 📊 **Step 5: Production Deployment**

### **Switch to Live Mode**
1. **Complete Business Verification** in Razorpay
2. **Generate Live API Keys**
3. **Update Firebase Functions Config**:
   ```bash
   firebase functions:config:set razorpay.key_id="rzp_live_your_live_key"
   firebase functions:config:set razorpay.key_secret="your_live_secret"
   ```
4. **Update Webhook URL** to production domain
5. **Deploy Updated Functions**:
   ```bash
   firebase deploy --only functions
   ```

### **Production Testing**
```bash
# Test with real payment methods
# Use small amounts (₹1-10) for testing
# Verify order creation in Firestore
# Check email notifications
# Test refund processing
```

---

## 📈 **Step 6: Monitoring & Analytics**

### **Payment Monitoring**
```bash
# Monitor function logs
firebase functions:log --only createRazorpayOrder

# Check payment success rates
firebase functions:log --only verifyRazorpayPayment

# Monitor webhook processing
firebase functions:log --only razorpayWebhook
```

### **Key Metrics to Track**
- Payment success rate (target: >95%)
- Average payment processing time
- Failed payment reasons
- Refund processing time
- Customer payment method preferences

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **"Function not found" Error**
```bash
# Verify function deployment
firebase functions:list

# Redeploy if needed
firebase deploy --only functions
```

#### **"Invalid signature" Error**
```bash
# Check webhook secret configuration
firebase functions:config:get razorpay.webhook_secret

# Verify webhook URL in Razorpay dashboard
```

#### **"Payment verification failed"**
```bash
# Check Razorpay key configuration
firebase functions:config:get razorpay

# Verify test card numbers
# Use: 4111111111111111 for success
```

#### **Email notifications not sending**
```bash
# Check email configuration
firebase functions:config:get email

# Test email function
firebase functions:shell
> sendOrderConfirmation({orderNumber: 'TEST', userEmail: 'test@example.com'})
```

---

## 🎉 **Success Criteria**

### **Payment System Ready When**:
- [ ] Orders can be created via Firebase Functions
- [ ] Payments process successfully with test cards
- [ ] Payment verification works correctly
- [ ] Webhooks are received and processed
- [ ] Refunds can be processed by admin
- [ ] Email notifications are sent automatically
- [ ] All payment methods work (cards, UPI, net banking)
- [ ] Production deployment successful

### **Business Ready When**:
- [ ] Real payments process successfully
- [ ] Customer receives order confirmations
- [ ] Admin can manage orders and refunds
- [ ] Payment analytics are available
- [ ] Customer support can handle payment issues

**Your Razorpay payment system is now production-ready!** 💳🏔️

---

*This guide ensures your payment processing is secure, reliable, and ready for real customers.*