import React from "react";
import { useAuthStore } from "../store/authStore";
import OrdersPage from "./OrdersPage";
import WishlistPage from "./WishlistPage";

export default function AccountPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser) {
    return <div className="p-10 text-center">Please login to view your account.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-3">Account</h1>
      <div className="mb-2 font-semibold">Name: {currentUser.displayName}</div>
      <div className="mb-4 font-semibold">Email: {currentUser.email}</div>
      <OrdersPage />
      <WishlistPage />
    </div>
  );
}
