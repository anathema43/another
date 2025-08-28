const { sendOrderConfirmation, sendShippingNotification, sendWelcomeEmail } = require('./sendEmail');
const { createRazorpayOrder, verifyRazorpayPayment, processRazorpayRefund, razorpayWebhook } = require('./razorpayAPI');

// Export all functions
exports.sendOrderConfirmation = sendOrderConfirmation;
exports.sendShippingNotification = sendShippingNotification;
exports.sendWelcomeEmail = sendWelcomeEmail;

// Export Razorpay functions
exports.createRazorpayOrder = createRazorpayOrder;
exports.verifyRazorpayPayment = verifyRazorpayPayment;
exports.processRazorpayRefund = processRazorpayRefund;
exports.razorpayWebhook = razorpayWebhook;