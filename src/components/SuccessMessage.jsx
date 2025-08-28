import React, { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SuccessMessage({ 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000,
  type = "success" 
}) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-100" : 
                  type === "error" ? "bg-red-100" : 
                  type === "warning" ? "bg-yellow-100" : "bg-blue-100";
  
  const textColor = type === "success" ? "text-green-700" : 
                    type === "error" ? "text-red-700" : 
                    type === "warning" ? "text-yellow-700" : "text-blue-700";
  
  const borderColor = type === "success" ? "border-green-200" : 
                      type === "error" ? "border-red-200" : 
                      type === "warning" ? "border-yellow-200" : "border-blue-200";

  return (
    <div className={`${bgColor} ${textColor} border ${borderColor} p-4 rounded-lg mb-4 animate-fade-in`} role="alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <span className="font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${textColor} hover:opacity-75 transition-opacity`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}