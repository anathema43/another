// src/config/razorpay.js
const razorpayConfig = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET,
  currency: 'INR',
  name: 'Ramro - Himalayan Products',
  description: 'Authentic products from the Himalayas',
  image: '/logo.png', // Your logo URL
  theme: {
    color: '#B97D4B' // Your brand color
  }
};

// Check if Razorpay keys are configured
const isRazorpayConfigured = razorpayConfig.keyId && 
  !razorpayConfig.keyId.includes('placeholder') && 
  !razorpayConfig.keyId.includes('your_') && 
  razorpayConfig.keyId !== '';

if (!isRazorpayConfigured) {
  console.info('ℹ️ Razorpay not configured yet. Payment features will be available once VITE_RAZORPAY_KEY_ID is set.');
}

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export { razorpayConfig, loadRazorpayScript, isRazorpayConfigured };
export default razorpayConfig;