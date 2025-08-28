const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id,
  key_secret: functions.config().razorpay.key_secret,
});

/**
 * Create Razorpay Order
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create orders.'
    );
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = data;

    // Validate required fields
    if (!amount || amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Valid amount is required'
      );
    }

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {}
    });

    console.log('Razorpay order created:', order.id);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create payment order',
      error.message
    );
  }
});

/**
 * Verify Razorpay Payment
 */
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to verify payments.'
    );
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = data;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required payment verification data'
      );
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', functions.config().razorpay.key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Payment signature verification failed'
      );
    }

    // Create order in Firestore
    const orderRef = await admin.firestore().collection('orders').add({
      ...orderData,
      userId: context.auth.uid,
      userEmail: context.auth.token.email,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentSignature: razorpay_signature,
      paymentStatus: 'completed',
      paymentMethod: 'razorpay',
      status: 'processing',
      orderNumber: `ORD-${Date.now()}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update inventory for each item
    const batch = admin.firestore().batch();
    for (const item of orderData.items) {
      const productRef = admin.firestore().collection('products').doc(item.id);
      const productDoc = await productRef.get();
      
      if (productDoc.exists) {
        const currentQuantity = productDoc.data().quantityAvailable || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        
        batch.update(productRef, {
          quantityAvailable: newQuantity,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    await batch.commit();

    console.log('Payment verified and order created:', orderRef.id);

    return {
      success: true,
      orderId: orderRef.id,
      orderNumber: `ORD-${Date.now()}`,
      message: 'Payment verified and order created successfully'
    };

  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Payment verification failed',
      error.message
    );
  }
});

/**
 * Process Refund
 */
exports.processRazorpayRefund = functions.https.onCall(async (data, context) => {
  // Verify authentication and admin role
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Check if user is admin
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
  
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can process refunds'
    );
  }

  try {
    const { payment_id, amount, reason = 'Customer request' } = data;

    if (!payment_id) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Payment ID is required'
      );
    }

    // Process refund with Razorpay
    const refund = await razorpay.payments.refund(payment_id, {
      amount: amount ? Math.round(amount * 100) : undefined, // Full refund if amount not specified
      notes: {
        reason: reason,
        processed_by: context.auth.uid,
        processed_at: new Date().toISOString()
      }
    });

    console.log('Refund processed:', refund.id);

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to rupees
      status: refund.status,
      message: 'Refund processed successfully'
    };

  } catch (error) {
    console.error('Error processing refund:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Refund processing failed',
      error.message
    );
  }
});

/**
 * Razorpay Webhook Handler
 */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const webhookSecret = functions.config().razorpay.webhook_secret;
    const webhookSignature = req.get('X-Razorpay-Signature');
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.error('Webhook signature verification failed');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    console.log('Webhook received:', event, paymentEntity.id);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
      case 'order.paid':
        await handleOrderPaid(paymentEntity);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).send('Webhook processed successfully');

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

async function handlePaymentCaptured(payment) {
  try {
    // Find order by Razorpay order ID
    const ordersSnapshot = await admin.firestore()
      .collection('orders')
      .where('razorpayOrderId', '==', payment.order_id)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'captured',
        paymentCapturedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Payment captured for order:', orderDoc.id);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    // Find order by Razorpay order ID
    const ordersSnapshot = await admin.firestore()
      .collection('orders')
      .where('razorpayOrderId', '==', payment.order_id)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'failed',
        paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Payment failed for order:', orderDoc.id);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(payment) {
  try {
    // Additional processing for paid orders
    console.log('Order paid webhook processed:', payment.order_id);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}