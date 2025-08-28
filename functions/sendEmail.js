const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your preferred email service
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

/**
 * Send Order Confirmation Email
 */
exports.sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderId = context.params.orderId;

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #B97D4B; color: white; padding: 20px; text-align: center;">
          <h1>🏔️ Ramro</h1>
          <h2>Order Confirmation</h2>
        </div>
        
        <div style="padding: 20px;">
          <h3>Thank you for your order!</h3>
          <p>Dear ${orderData.shipping.firstName},</p>
          <p>We've received your order and are preparing your authentic Himalayan products.</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h4>Order Details</h4>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ₹${orderData.total}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h4>Items Ordered:</h4>
            ${orderData.items.map(item => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}
              </div>
            `).join('')}
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h4>Shipping Address:</h4>
            <p>
              ${orderData.shipping.firstName} ${orderData.shipping.lastName}<br>
              ${orderData.shipping.address}<br>
              ${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zipCode}
            </p>
          </div>
          
          <p>We'll send you another email when your order ships with tracking information.</p>
          <p>Thank you for supporting Himalayan artisans!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Best regards,<br>The Ramro Team</p>
            <p>🏔️ Authentic products from the heart of the Himalayas</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'Ramro <noreply@ramro.com>',
      to: orderData.shipping.email,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: emailTemplate
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent for order ${orderId}`);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  });

/**
 * Send Shipping Notification Email
 */
exports.sendShippingNotification = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const orderId = context.params.orderId;

    // Check if status changed to 'shipped'
    if (beforeData.status !== 'shipped' && afterData.status === 'shipped') {
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3E5954; color: white; padding: 20px; text-align: center;">
            <h1>🏔️ Ramro</h1>
            <h2>Your Order Has Shipped!</h2>
          </div>
          
          <div style="padding: 20px;">
            <h3>Great news! Your order is on its way!</h3>
            <p>Dear ${afterData.shipping.firstName},</p>
            <p>Your order has been shipped and is on its way to you.</p>
            
            <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
              <h4>📦 Shipping Details</h4>
              <p><strong>Order Number:</strong> ${afterData.orderNumber}</p>
              <p><strong>Tracking Number:</strong> ${afterData.trackingNumber || 'Will be updated soon'}</p>
              <p><strong>Estimated Delivery:</strong> 3-7 business days</p>
              <p><strong>Shipping Method:</strong> ${afterData.shippingMethod || 'Standard Delivery'}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h4>Delivery Address:</h4>
              <p>
                ${afterData.shipping.firstName} ${afterData.shipping.lastName}<br>
                ${afterData.shipping.address}<br>
                ${afterData.shipping.city}, ${afterData.shipping.state} ${afterData.shipping.zipCode}
              </p>
            </div>
            
            ${afterData.trackingNumber ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://track.example.com/${afterData.trackingNumber}" 
                   style="background: #B97D4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Track Your Package
                </a>
              </div>
            ` : ''}
            
            <p>You'll receive another email when your package is delivered.</p>
            <p>Thank you for choosing Ramro!</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Best regards,<br>The Ramro Team</p>
              <p>🚚 Bringing the Himalayas to your doorstep</p>
            </div>
          </div>
        </div>
      `;

      const mailOptions = {
        from: 'Ramro <noreply@ramro.com>',
        to: afterData.shipping.email,
        subject: `Your Order Has Shipped! - ${afterData.orderNumber}`,
        html: emailTemplate
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Shipping notification email sent for order ${orderId}`);
      } catch (error) {
        console.error('Error sending shipping notification email:', error);
      }
    }

    // Check if status changed to 'delivered'
    if (beforeData.status !== 'delivered' && afterData.status === 'delivered') {
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1>🏔️ Ramro</h1>
            <h2>Order Delivered Successfully!</h2>
          </div>
          
          <div style="padding: 20px;">
            <h3>🎉 Your order has been delivered!</h3>
            <p>Dear ${afterData.shipping.firstName},</p>
            <p>We're delighted to confirm that your order has been successfully delivered.</p>
            
            <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
              <h4>✅ Delivery Confirmation</h4>
              <p><strong>Order Number:</strong> ${afterData.orderNumber}</p>
              <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Delivered To:</strong> ${afterData.shipping.address}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p>How was your experience?</p>
              <a href="https://ramro.com/reviews/${afterData.orderNumber}" 
                 style="background: #B97D4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
                Leave a Review
              </a>
              <a href="https://ramro.com/shop" 
                 style="background: #3E5954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
                Shop Again
              </a>
            </div>
            
            <p>We hope you love your authentic Himalayan products!</p>
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Thank you for supporting Himalayan artisans!</p>
              <p>Best regards,<br>The Ramro Team</p>
              <p>📧 support@ramro.com | 📞 +977 1 234 5678</p>
            </div>
          </div>
        </div>
      `;

      const mailOptions = {
        from: 'Ramro <noreply@ramro.com>',
        to: afterData.shipping.email,
        subject: `Order Delivered! - ${afterData.orderNumber}`,
        html: emailTemplate
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Delivery confirmation email sent for order ${orderId}`);
      } catch (error) {
        console.error('Error sending delivery confirmation email:', error);
      }
    }
  });

/**
 * Send Welcome Email for New Users
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #B97D4B; color: white; padding: 20px; text-align: center;">
        <h1>🏔️ Welcome to Ramro!</h1>
      </div>
      
      <div style="padding: 20px;">
        <h3>Welcome to the Himalayan marketplace!</h3>
        <p>Dear ${user.displayName || 'Friend'},</p>
        <p>Thank you for joining Ramro! We're excited to share authentic Himalayan products and artisan stories with you.</p>
        
        <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h4>🎯 What makes Ramro special:</h4>
          <ul>
            <li>🌱 100% organic and authentic products</li>
            <li>🤝 Direct support to Himalayan artisans</li>
            <li>📖 Rich cultural stories behind every product</li>
            <li>🚚 Free shipping on orders over ₹500</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ramro.com/shop" 
             style="background: #B97D4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Start Shopping
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://ramro.com/artisans" 
             style="background: #3E5954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Meet Our Artisans
          </a>
        </div>
        
        <p>If you have any questions, our support team is here to help!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <p>Happy shopping!</p>
          <p>The Ramro Team</p>
          <p>📧 support@ramro.com | 🌐 ramro.com</p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: 'Ramro <welcome@ramro.com>',
    to: user.email,
    subject: '🏔️ Welcome to Ramro - Your Himalayan Marketplace!',
    html: emailTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
});