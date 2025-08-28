// src/firebase/cloudFunctions.js

// Example: Call Stripe payment intent cloud function
export async function createStripePaymentIntent({ amount, currency = "INR" }) {
  const response = await fetch(
    "https://<YOUR_CLOUD_FUNCTION_URL>/createStripePaymentIntent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency }),
    }
  );
  if (!response.ok) throw new Error("Failed to create payment intent");
  return await response.json(); // Should return {clientSecret: "..."}
}
