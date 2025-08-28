import React from "react";

export default function AppMessage({ message, type = "info", onClose }) {
  if (!message) return null;
  const color = type === "error" ? "bg-red-100 text-red-700"
              : type === "success" ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700";
  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-xl z-50 ${color}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-6 font-bold hover:underline">Close</button>
      )}
    </div>
  );
}
