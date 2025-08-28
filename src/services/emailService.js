// Email service for order notifications
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';

// Email templates
const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset'
};

class EmailService {
  constructor() {
    this.sendEmail = httpsCallable(functions, 'sendEmail');
  }

  async sendOrderConfirmation(orderData) {
    try {
      const emailData = {
        template: EMAIL_TEMPLATES.ORDER_CONFIRMATION,
        to: orderData.userEmail,
        data: {
          customerName: orderData.shipping.firstName,
          orderNumber: orderData.orderNumber,
          orderDate: new Date(orderData.createdAt).toLocaleDateString(),
          items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          total: orderData.total,
          shippingAddress: orderData.shipping
        }
      };

      const result = await this.sendEmail(emailData);
      console.log('Order confirmation email sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  async sendOrderStatusUpdate(orderData, newStatus) {
    try {
      let template;
      let subject;
      
      switch (newStatus) {
        case 'shipped':
          template = EMAIL_TEMPLATES.ORDER_SHIPPED;
          subject = `Your order #${orderData.orderNumber} has been shipped!`;
          break;
        case 'delivered':
          template = EMAIL_TEMPLATES.ORDER_DELIVERED;
          subject = `Your order #${orderData.orderNumber} has been delivered!`;
          break;
        case 'cancelled':
          template = EMAIL_TEMPLATES.ORDER_CANCELLED;
          subject = `Your order #${orderData.orderNumber} has been cancelled`;
          break;
        default:
          return; // Don't send email for other status changes
      }

      const emailData = {
        template,
        to: orderData.userEmail,
        subject,
        data: {
          customerName: orderData.shipping?.firstName || 'Customer',
          orderNumber: orderData.orderNumber,
          status: newStatus,
          trackingNumber: orderData.trackingNumber,
          estimatedDelivery: orderData.estimatedDelivery,
          items: orderData.items?.map(item => ({
            name: item.name,
            quantity: item.quantity
          })) || []
        }
      };

      const result = await this.sendEmail(emailData);
      console.log(`Order ${newStatus} email sent:`, result.data);
      return result.data;
    } catch (error) {
      console.error(`Error sending order ${newStatus} email:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(userData) {
    try {
      const emailData = {
        template: EMAIL_TEMPLATES.WELCOME,
        to: userData.email,
        data: {
          customerName: userData.displayName || 'Customer',
          loginUrl: `${window.location.origin}/#/login`,
          shopUrl: `${window.location.origin}/#/shop`
        }
      };

      const result = await this.sendEmail(emailData);
      console.log('Welcome email sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendLowStockAlert(productData, threshold = 5) {
    try {
      if (productData.inventory > threshold) return;

      const emailData = {
        template: 'low_stock_alert',
        to: 'admin@ramro.com', // Admin email
        data: {
          productName: productData.name,
          currentStock: productData.inventory,
          sku: productData.sku,
          threshold,
          productUrl: `${window.location.origin}/#/products/${productData.id}`
        }
      };

      const result = await this.sendEmail(emailData);
      console.log('Low stock alert sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error sending low stock alert:', error);
      throw error;
    }
  }

  async sendNewsletterSubscriptionConfirmation(email, name) {
    try {
      const emailData = {
        template: 'newsletter_confirmation',
        to: email,
        data: {
          customerName: name || 'Customer',
          unsubscribeUrl: `${window.location.origin}/unsubscribe?email=${encodeURIComponent(email)}`
        }
      };

      const result = await this.sendEmail(emailData);
      console.log('Newsletter confirmation sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error sending newsletter confirmation:', error);
      throw error;
    }
  }

  // Fallback email service using a simple HTTP endpoint
  async sendSimpleEmail(to, subject, htmlContent) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html: htmlContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending simple email:', error);
      throw error;
    }
  }

  // Generate simple HTML email templates
  generateOrderConfirmationHTML(orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #B97D4B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; color: #B97D4B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ Ramro</h1>
            <h2>Order Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear ${orderData.shipping.firstName},</p>
            <p>Thank you for your order! We're excited to prepare your authentic Himalayan products.</p>
            
            <div class="order-details">
              <h3>Order #${orderData.orderNumber}</h3>
              <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
              
              <h4>Items Ordered:</h4>
              ${orderData.items.map(item => `
                <div class="item">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}
                </div>
              `).join('')}
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #B97D4B;">
                <p class="total">Total: ₹${orderData.total}</p>
              </div>
            </div>
            
            <div class="order-details">
              <h4>Shipping Address:</h4>
              <p>
                ${orderData.shipping.firstName} ${orderData.shipping.lastName}<br>
                ${orderData.shipping.address}<br>
                ${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zipCode}
              </p>
            </div>
            
            <p>We'll send you another email when your order ships. Thank you for supporting Himalayan artisans!</p>
            <p>Best regards,<br>The Ramro Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;