import React, { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import formatCurrency from "../utils/formatCurrency";

function CheckoutPage() {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const createOrder = useOrderStore((state) => state.createOrder);

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInput = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // Simple validation
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.zip || !shipping.phone) {
      setError("All fields are required.");
      setSubmitting(false);
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      setSubmitting(false);
      return;
    }

    try {
      // This creates an order in Firestore (or wherever your store/orderStore.js is hooked)
      await createOrder({
        items: cart,
        shipping,
        total,
        createdAt: Date.now(),
      });
      setSuccess("Order placed! Thank you for shopping Ramro 🏔️");
      clearCart();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-himalaya-dark mb-4">Checkout</h1>
      <form className="space-y-4" onSubmit={handleCheckout}>
        <input
          name="name"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          value={shipping.name}
          onChange={handleInput}
        />
        <input
          name="address"
          placeholder="Shipping Address"
          className="w-full p-2 border rounded"
          value={shipping.address}
          onChange={handleInput}
        />
        <input
          name="city"
          placeholder="City"
          className="w-full p-2 border rounded"
          value={shipping.city}
          onChange={handleInput}
        />
        <input
          name="zip"
          placeholder="ZIP Code"
          className="w-full p-2 border rounded"
          value={shipping.zip}
          onChange={handleInput}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
          value={shipping.phone}
          onChange={handleInput}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="font-semibold text-lg">Total:</span>
          <span className="font-bold text-green-700 text-xl">{formatCurrency(total)}</span>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-700 font-bold">{success}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-himalaya-dark text-white rounded hover:bg-himalaya transition"
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Place Order"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Order Summary</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between mb-2">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
