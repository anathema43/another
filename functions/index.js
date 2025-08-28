const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: functions.config().razorpay?.key_id || 'rzp_test_placeholder',
  key_secret: functions.config().razorpay?.key_secret || 'placeholder_secret'
});

// Email transporter
const createEmailTransporter = () => {
  const emailConfig = functions.config().email;
  
  if (!emailConfig?.user || !emailConfig?.password) {
    console.warn('Email configuration not found');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password
    }
  });
};

// Create Razorpay Order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { amount, currency = 'INR', receipt } = data;

    if (!amount || amount <= 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      payment_capture: 1
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create order');
  }
});

// Verify Razorpay Payment
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = data;

    // Verify signature
    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', functions.config().razorpay?.key_secret || 'placeholder')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid payment signature');
    }

    // Create order in Firestore
    const orderRef = admin.firestore().collection('orders').doc();
    await orderRef.set({
      ...orderData,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'completed',
      status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        ...orderData,
        id: orderRef.id,
        paymentId: razorpay_payment_id
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return {
      success: true,
      orderId: orderRef.id,
      paymentId: razorpay_payment_id
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});

// Send Order Confirmation Email
const sendOrderConfirmationEmail = async (orderData) => {
  const transporter = createEmailTransporter();
  if (!transporter) return;

  const mailOptions = {
    from: functions.config().email?.user || 'noreply@darjeelingsouls.com',
    to: orderData.shipping?.email || orderData.userEmail,
    subject: `Order Confirmation - ${orderData.orderNumber || orderData.id}`,
    html: generateOrderConfirmationHTML(orderData)
  };

  await transporter.sendMail(mailOptions);
};

// Generate Order Confirmation HTML
const generateOrderConfirmationHTML = (orderData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #D9734E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #D9734E; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏔️ Darjeeling Souls</h1>
          <h2>Order Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${orderData.shipping?.firstName || 'Customer'},</p>
          <p>Thank you for your order! We're excited to prepare your authentic Darjeeling products.</p>
          
          <div class="order-details">
            <h3>Order #${orderData.orderNumber || orderData.id}</h3>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h4>Items Ordered:</h4>
            ${orderData.items?.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}
              </div>
            `).join('') || '<p>No items found</p>'}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #D9734E;">
            <div class="order-details">
              <h4>Shipping Address:</h4>
              <p>
                ${orderData.shipping?.firstName || ''} ${orderData.shipping?.lastName || ''}<br>
                ${orderData.shipping?.address || ''}<br>
                ${orderData.shipping?.city || ''}, ${orderData.shipping?.state || ''} ${orderData.shipping?.zipCode || ''}
              </p>
            </div>
            
              <p class="total">Total: ₹${orderData.total || 0}</p>
            </div>
          </div>
          
          <p>We'll send you another email when your order ships. Thank you for supporting Darjeeling artisans!</p>
          <p>Best regards,<br>The Darjeeling Souls Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send Email Function (Generic)
exports.sendEmail = functions.https.onCall(async (data, context) => {
  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      throw new functions.https.HttpsError('failed-precondition', 'Email service not configured');
    }

    const { template, to, subject, data: emailData } = data;

    let htmlContent = '';
    let emailSubject = subject;

    switch (template) {
      case 'order_confirmation':
        htmlContent = generateOrderConfirmationHTML(emailData);
        emailSubject = `Order Confirmation - ${emailData.orderNumber}`;
        break;
      case 'welcome':
        htmlContent = generateWelcomeHTML(emailData);
        emailSubject = 'Welcome to Darjeeling Souls!';
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Unknown email template');
    }

    const mailOptions = {
      from: functions.config().email?.user || 'noreply@darjeelingsouls.com',
      to,
      subject: emailSubject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    return { success: true, messageId: 'sent' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Generate Welcome Email HTML
const generateWelcomeHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #D9734E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏔️ Welcome to Darjeeling Souls</h1>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Welcome to Darjeeling Souls! We're thrilled to have you join our community of authentic product lovers.</p>
          <p>Explore our collection of handcrafted goods from the beautiful Darjeeling hills.</p>
          <p>Best regards,<br>The Darjeeling Souls Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Razorpay Webhook Handler
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', functions.config().razorpay?.webhook_secret || 'placeholder')
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    
    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

const handlePaymentCaptured = async (payment) => {
  console.log('Payment captured:', payment.id);
  // Update order status, send notifications, etc.
};

const handlePaymentFailed = async (payment) => {
  console.log('Payment failed:', payment.id);
  // Handle failed payment, update order status, etc.
};